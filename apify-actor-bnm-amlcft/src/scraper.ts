/**
 * Web Scraper for Bank Negara Malaysia AML/CFT Documents
 * Uses session-based downloading with proper cookie handling
 */

import { PlaywrightCrawler, RequestQueue, Dataset, KeyValueStore, log } from 'crawlee';
import { Actor } from 'apify';
import { Page, BrowserContext } from 'playwright';
import { ActorInput, PDFLink, ScrapingStats } from './types.js';

const DEFAULT_INPUT: ActorInput = {
  startUrls: [{ url: 'https://amlcft.bnm.gov.my/the-amla' }],
  maxPdfsToDownload: 0,
  extractFullText: false,
  followLinks: false,
  maxCrawlDepth: 1,
  pdfKeywords: [],
};

interface DownloadedPDF {
  filename: string;
  linkText: string;
  sourceUrl: string;
  foundOnPage: string;
  fileSize: number;
  downloadedAt: string;
  keyValueStoreKey?: string;
  status?: string;
  error?: string;
}

export class BNMAMLCFTScraper {
  private input: ActorInput;
  private requestQueue!: RequestQueue;
  private dataset!: Dataset;
  private keyValueStore!: KeyValueStore;
  private stats: ScrapingStats;
  private processedPdfs: Set<string>;
  private visitedPages: Set<string>;

  constructor(input: Partial<ActorInput>) {
    this.input = { ...DEFAULT_INPUT, ...input };
    this.processedPdfs = new Set();
    this.visitedPages = new Set();
    this.stats = {
      pagesVisited: 0,
      pdfsFound: 0,
      pdfsDownloaded: 0,
      pdfsProcessed: 0,
      pdfsFailed: 0,
      totalTextExtracted: 0,
      startTime: new Date().toISOString(),
    };
  }

  async initialize(): Promise<void> {
    this.requestQueue = await RequestQueue.open();
    this.dataset = await Dataset.open();
    this.keyValueStore = await KeyValueStore.open();

    for (const { url } of this.input.startUrls) {
      await this.requestQueue.addRequest({ url, userData: { depth: 0 } });
    }

    log.info('Scraper initialized');
  }

  async run(): Promise<void> {
    await this.initialize();

    const crawler = new PlaywrightCrawler({
      requestQueue: this.requestQueue,
      maxConcurrency: 1,
      requestHandlerTimeoutSecs: 300,
      headless: true,
      
      launchContext: {
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },

      requestHandler: async ({ request, page }) => {
        const { url } = request;
        const depth = request.userData.depth as number;

        log.info(`Processing: ${url}`);
        this.visitedPages.add(url);
        this.stats.pagesVisited++;

        // Wait for full page load to establish session
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(3000);

        // Find PDF links
        const pdfLinks = await this.findPdfLinks(page, url);
        log.info(`Found ${pdfLinks.length} PDF links`);

        for (const pdfLink of pdfLinks) {
          if (this.input.maxPdfsToDownload > 0 && this.stats.pdfsDownloaded >= this.input.maxPdfsToDownload) break;
          if (this.processedPdfs.has(pdfLink.url)) continue;
          if (!this.matchesKeywordFilter(pdfLink)) continue;

          this.processedPdfs.add(pdfLink.url);
          this.stats.pdfsFound++;

          log.info(`Downloading: ${pdfLink.linkText}`);
          
          // Use the SAME page to download (keeps session/cookies)
          await this.downloadWithSession(page, pdfLink);
        }

        if (this.input.followLinks && depth < this.input.maxCrawlDepth) {
          const subPages = await this.findSubPageLinks(page, url);
          for (const subUrl of subPages.slice(0, 5)) {
            if (!this.visitedPages.has(subUrl)) {
              await this.requestQueue.addRequest({ url: subUrl, userData: { depth: depth + 1 } });
            }
          }
        }
      },

      failedRequestHandler: async ({ request }) => {
        log.error(`Failed: ${request.url}`);
      },
    });

    await crawler.run();

    this.stats.endTime = new Date().toISOString();
    this.stats.duration = Date.now() - new Date(this.stats.startTime).getTime();
    await this.keyValueStore.setValue('SCRAPING_STATS', this.stats);
    log.info('Completed', this.stats);
  }

  private async findPdfLinks(page: Page, pageUrl: string): Promise<PDFLink[]> {
    const links = await page.evaluate(() => {
      const results: { href: string; text: string }[] = [];
      const seen = new Set<string>();

      document.querySelectorAll('a[href*=".pdf"], a[href*="/documents/"]').forEach((a) => {
        const href = (a as HTMLAnchorElement).href;
        const text = a.textContent?.trim() || '';
        if (href && !seen.has(href)) {
          seen.add(href);
          results.push({ href, text });
        }
      });

      return results;
    });

    return links.map(l => ({ url: l.href, linkText: l.text, foundOnPage: pageUrl }));
  }

  /**
   * Download PDF using the browser's fetch with established session
   */
  private async downloadWithSession(page: Page, pdfLink: PDFLink): Promise<void> {
    const filename = this.extractFilename(pdfLink.url);
    
    try {
      log.info(`Fetching PDF with browser session: ${pdfLink.url}`);
      
      // Use page.evaluate to fetch with the browser's cookies and session
      const result = await page.evaluate(async (url: string) => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            credentials: 'include', // Include cookies
            headers: {
              'Accept': 'application/pdf,application/octet-stream,*/*',
            },
            redirect: 'follow',
          });

          if (!response.ok) {
            return { success: false, error: `HTTP ${response.status} ${response.statusText}` };
          }

          const contentType = response.headers.get('content-type') || '';
          const blob = await response.blob();
          
          // Convert blob to base64
          return new Promise<{ success: boolean; data?: string; contentType?: string; size?: number; error?: string }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve({ 
                success: true, 
                data: base64, 
                contentType,
                size: blob.size 
              });
            };
            reader.onerror = () => resolve({ success: false, error: 'Failed to read blob' });
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          return { success: false, error: String(e) };
        }
      }, pdfLink.url);

      if (result.success && result.data) {
        const pdfBuffer = Buffer.from(result.data, 'base64');
        
        log.info(`Received ${pdfBuffer.length} bytes, content-type: ${result.contentType}`);
        
        // Check if it's actually a PDF
        const header = pdfBuffer.slice(0, 10).toString();
        log.info(`File header: ${header.substring(0, 20)}`);
        
        if (header.startsWith('%PDF')) {
          await this.savePdf(pdfBuffer, pdfLink, filename);
          return;
        } else if (header.includes('<!DOCTYPE') || header.includes('<html')) {
          log.warning('Received HTML instead of PDF');
        } else {
          log.warning(`Unknown content type, header: ${header.substring(0, 50)}`);
        }
      } else {
        log.warning(`Fetch failed: ${result.error}`);
      }

      // If fetch didn't work, try navigating to the URL in the same page context
      log.info('Trying navigation approach...');
      
      // Store current URL to go back
      const currentUrl = page.url();
      
      // Navigate to PDF
      const response = await page.goto(pdfLink.url, { 
        waitUntil: 'commit',
        timeout: 60000 
      });

      if (response) {
        const contentType = response.headers()['content-type'] || '';
        log.info(`Navigation response content-type: ${contentType}`);
        
        if (contentType.includes('application/pdf')) {
          const body = await response.body();
          if (body && body.slice(0, 5).toString().startsWith('%PDF')) {
            await this.savePdf(body, pdfLink, filename);
            // Go back to original page
            await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
            return;
          }
        }
      }

      // Go back to original page
      await page.goto(currentUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});

      // If still failed, save as failed with URL for manual download
      this.stats.pdfsFailed++;
      log.warning(`Could not download automatically: ${pdfLink.linkText}`);
      
      await this.dataset.pushData({
        filename,
        linkText: pdfLink.linkText,
        sourceUrl: pdfLink.url,
        foundOnPage: pdfLink.foundOnPage,
        fileSize: 0,
        downloadedAt: new Date().toISOString(),
        status: 'manual_download_required',
        error: 'Automated download blocked - use the sourceUrl to download manually',
      } as DownloadedPDF);

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      log.error(`Download error: ${msg}`);
      this.stats.pdfsFailed++;
      
      await this.dataset.pushData({
        filename,
        linkText: pdfLink.linkText,
        sourceUrl: pdfLink.url,
        foundOnPage: pdfLink.foundOnPage,
        fileSize: 0,
        downloadedAt: new Date().toISOString(),
        status: 'failed',
        error: msg,
      } as DownloadedPDF);
    }
  }

  private async savePdf(pdfBuffer: Buffer, pdfLink: PDFLink, filename: string): Promise<void> {
    const key = `PDF_${filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 200)}`;
    
    await this.keyValueStore.setValue(key, pdfBuffer, { contentType: 'application/pdf' });
    
    this.stats.pdfsDownloaded++;
    this.stats.pdfsProcessed++;
    
    log.info(`✓ DOWNLOADED: ${filename} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

    await this.dataset.pushData({
      filename,
      linkText: pdfLink.linkText,
      sourceUrl: pdfLink.url,
      foundOnPage: pdfLink.foundOnPage,
      fileSize: pdfBuffer.length,
      downloadedAt: new Date().toISOString(),
      keyValueStoreKey: key,
      status: 'success',
    } as DownloadedPDF);
  }

  private async findSubPageLinks(page: Page, pageUrl: string): Promise<string[]> {
    const links = await page.$$eval('a[href]', (anchors) => 
      anchors
        .map(a => (a as HTMLAnchorElement).href)
        .filter(href => href && !href.includes('.pdf') && !href.startsWith('#'))
    );

    return links.filter(url => {
      try { return new URL(url).hostname.includes('bnm.gov.my'); } 
      catch { return false; }
    });
  }

  private extractFilename(url: string): string {
    try {
      const parts = new URL(url).pathname.split('/');
      for (const part of parts) {
        if (part.toLowerCase().includes('.pdf')) return decodeURIComponent(part);
      }
      return parts.pop() || 'document.pdf';
    } catch {
      return 'document.pdf';
    }
  }

  private matchesKeywordFilter(pdfLink: PDFLink): boolean {
    if (this.input.pdfKeywords.length === 0) return true;
    const text = `${pdfLink.url} ${pdfLink.linkText}`.toLowerCase();
    return this.input.pdfKeywords.some(kw => text.includes(kw.toLowerCase()));
  }

  getStats(): ScrapingStats {
    return { ...this.stats };
  }
}

export async function runScraper(input: Partial<ActorInput>): Promise<ScrapingStats> {
  const scraper = new BNMAMLCFTScraper(input);
  await scraper.run();
  return scraper.getStats();
}
