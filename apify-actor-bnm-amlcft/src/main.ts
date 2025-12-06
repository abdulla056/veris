/**
 * Bank Negara Malaysia AML/CFT PDF Downloader & Compliance Extractor
 * 
 * 1. Downloads PDFs from BNM AML/CFT website
 * 2. Extracts text from PDFs
 * 3. Processes with Claude AI to extract structured compliance data
 */

import { Actor, log } from 'apify';
import { ActorInput } from './types.js';
import { runScraper } from './scraper.js';
import { processWithClaude, ComplianceData } from './claude-processor.js';
import { uploadToConvex } from './convex-uploader.js';
import pdf from 'pdf-parse';

interface ExtendedInput extends ActorInput {
  anthropicApiKey?: string;
  processWithClaude?: boolean;
  convexUrl?: string;
  uploadToConvex?: boolean;
}

await Actor.init();

log.info('========================================');
log.info('BNM AML/CFT Compliance Extractor');
log.info('========================================');

try {
  const rawInput = await Actor.getInput<Partial<ExtendedInput>>() ?? {};
  
  const input: ExtendedInput = {
    startUrls: rawInput.startUrls ?? [{ url: 'https://amlcft.bnm.gov.my/the-amla' }],
    maxPdfsToDownload: rawInput.maxPdfsToDownload ?? 0,
    extractFullText: true,
    followLinks: rawInput.followLinks ?? false,
    maxCrawlDepth: rawInput.maxCrawlDepth ?? 1,
    pdfKeywords: rawInput.pdfKeywords ?? [],
    anthropicApiKey: rawInput.anthropicApiKey,
    processWithClaude: rawInput.processWithClaude ?? true,
    convexUrl: rawInput.convexUrl,
    uploadToConvex: rawInput.uploadToConvex ?? true,
  };
  
  log.info('Configuration:', {
    startUrls: input.startUrls.map(u => u.url),
    maxPdfsToDownload: input.maxPdfsToDownload || 'unlimited',
    processWithClaude: input.processWithClaude,
    hasApiKey: !!input.anthropicApiKey,
    uploadToConvex: input.uploadToConvex,
    hasConvexUrl: !!input.convexUrl,
  });

  // Step 1: Download PDFs
  log.info('Step 1: Downloading PDFs...');
  const stats = await runScraper(input);

  // Step 2: Get downloaded PDFs from key-value store
  const keyValueStore = await Actor.openKeyValueStore();
  const dataset = await Actor.openDataset();
  const { items } = await dataset.getData();

  const successfulDownloads = items.filter((item: any) => item.keyValueStoreKey);
  log.info(`Downloaded ${successfulDownloads.length} PDFs successfully`);

  // Step 3: Process with Claude if API key provided
  if (input.processWithClaude && input.anthropicApiKey && successfulDownloads.length > 0) {
    log.info('Step 2: Processing PDFs with Claude AI...');
    
    const complianceResults: Array<{
      filename: string;
      sourceUrl: string;
      compliance: ComplianceData | null;
      status: string;
    }> = [];

    for (const item of successfulDownloads) {
      const pdfItem = item as any;
      log.info(`Processing: ${pdfItem.filename}`);

      try {
        // Get PDF from key-value store
        const pdfBuffer = await keyValueStore.getValue(pdfItem.keyValueStoreKey) as Buffer;
        
        if (!pdfBuffer) {
          log.warning(`PDF not found in store: ${pdfItem.keyValueStoreKey}`);
          continue;
        }

        // Extract text from PDF
        log.info('Extracting text from PDF...');
        const pdfData = await pdf(pdfBuffer);
        const pdfText = pdfData.text;

        log.info(`Extracted ${pdfText.length} characters from ${pdfItem.filename}`);

        // Process with Claude
        log.info('Sending to Claude for analysis...');
        const compliance = await processWithClaude(
          pdfText,
          input.anthropicApiKey,
          pdfItem.filename
        );

        if (compliance) {
          // Save structured compliance data
          const complianceKey = `COMPLIANCE_${pdfItem.filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
          await keyValueStore.setValue(complianceKey, compliance);

          complianceResults.push({
            filename: pdfItem.filename,
            sourceUrl: pdfItem.sourceUrl,
            compliance,
            status: 'success',
          });

          log.info(`✓ Extracted compliance data for: ${pdfItem.filename}`);
        } else {
          complianceResults.push({
            filename: pdfItem.filename,
            sourceUrl: pdfItem.sourceUrl,
            compliance: null,
            status: 'failed',
          });
        }

        // Delay between API calls
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        log.error(`Failed to process ${pdfItem.filename}: ${msg}`);
        
        complianceResults.push({
          filename: pdfItem.filename,
          sourceUrl: pdfItem.sourceUrl,
          compliance: null,
          status: 'error: ' + msg,
        });
      }
    }

    // Save all compliance results to dataset
    const complianceDataset = await Actor.openDataset('compliance-data');
    for (const result of complianceResults) {
      await complianceDataset.pushData(result);
    }

    // Save summary
    await keyValueStore.setValue('COMPLIANCE_SUMMARY', {
      totalProcessed: complianceResults.length,
      successful: complianceResults.filter(r => r.status === 'success').length,
      failed: complianceResults.filter(r => r.status !== 'success').length,
      results: complianceResults,
    });

    log.info('========================================');
    log.info('Compliance Extraction Complete');
    log.info('========================================');
    log.info(`Processed: ${complianceResults.length} PDFs`);
    log.info(`Successful: ${complianceResults.filter(r => r.status === 'success').length}`);
    log.info(`Failed: ${complianceResults.filter(r => r.status !== 'success').length}`);

    // Step 4: Upload to Convex if configured
    if (input.uploadToConvex && input.convexUrl) {
      log.info('========================================');
      log.info('Step 3: Uploading to Convex...');
      log.info('========================================');

      const convexStats = await uploadToConvex(complianceResults, {
        deploymentUrl: input.convexUrl,
      });

      log.info(`Convex upload: ${convexStats.uploaded} uploaded, ${convexStats.failed} failed`);
      
      if (convexStats.errors.length > 0) {
        log.warning('Convex upload errors:', { errors: convexStats.errors });
      }
    } else if (input.uploadToConvex && !input.convexUrl) {
      log.warning('Convex upload enabled but no CONVEX_URL provided');
      log.info('To upload to Convex, provide your deployment URL in the input');
    }

  } else if (input.processWithClaude && !input.anthropicApiKey) {
    log.warning('Claude processing enabled but no API key provided');
    log.info('To process PDFs with Claude, provide your ANTHROPIC_API_KEY in the input');
  }

  // Final output
  log.info('========================================');
  log.info('Run Complete');
  log.info('========================================');
  log.info(`Pages visited: ${stats.pagesVisited}`);
  log.info(`PDFs found: ${stats.pdfsFound}`);
  log.info(`PDFs downloaded: ${stats.pdfsDownloaded}`);
  log.info(`Duration: ${stats.duration ? (stats.duration / 1000).toFixed(2) : 'N/A'} seconds`);

  await Actor.setValue('OUTPUT', {
    success: true,
    stats,
    downloadedFiles: successfulDownloads.length,
    claudeProcessed: input.processWithClaude && input.anthropicApiKey,
  });

} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  log.error('Run failed:', { error: errorMessage });
  
  await Actor.setValue('OUTPUT', {
    success: false,
    error: errorMessage,
  });
  
  throw error;
} finally {
  await Actor.exit();
}
