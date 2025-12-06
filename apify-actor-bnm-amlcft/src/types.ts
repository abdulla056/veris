/**
 * Type definitions for the BNM AML/CFT Scraper
 * Updated to match compliance analysis JSON format
 */

export interface ActorInput {
  startUrls: Array<{ url: string }>;
  maxPdfsToDownload: number;
  extractFullText: boolean;
  followLinks: boolean;
  maxCrawlDepth: number;
  pdfKeywords: string[];
  proxyConfiguration?: ProxyConfiguration;
}

export interface ProxyConfiguration {
  useApifyProxy?: boolean;
  apifyProxyGroups?: string[];
  proxyUrls?: string[];
}

// ============================================
// New Compliance Document Format
// ============================================

export interface ComplianceDocument {
  /** Unique identifier for the document */
  id: string;
  /** Original filename of the PDF */
  filename: string;
  /** Full URL where the PDF was downloaded from */
  sourceUrl: string;
  /** URL of the page where this PDF link was found */
  foundOnPage: string;
  /** Link text associated with the PDF download link */
  linkText: string;
  /** File size in bytes */
  fileSize: number;
  /** Date when the PDF was scraped */
  scrapedAt: string;
  /** Number of pages in the PDF */
  pageCount: number;
  /** Processing status */
  status: 'success' | 'partial' | 'failed';
  /** Error message if processing failed */
  error?: string;
  /** Full extracted text (optional) */
  fullText?: string;
  /** Structured compliance data */
  compliance: ComplianceData;
}

export interface ComplianceData {
  act_name: string;
  jurisdiction: string;
  version: string;
  last_updated: string;
  definitions: Definition[];
  obligations: Obligation[];
  procedures: Procedure[];
  offences: Offence[];
  penalties: Penalty[];
  recordkeeping_requirements: RecordkeepingRequirement;
  applicability: Applicability[];
  exceptions: Exception[];
  cross_references: CrossReference[];
}

export interface Definition {
  term: string;
  meaning: string;
  source_section: string;
}

export interface Obligation {
  name: string;
  description: string;
  applies_to: string[];
  source_section: string;
  risk_level: 'high' | 'medium' | 'low' | '';
}

export interface Procedure {
  name: string;
  steps: string[];
  conditions: string;
  source_section: string;
}

export interface Offence {
  offence: string;
  description: string;
  source_section: string;
}

export interface Penalty {
  offence: string;
  fine_amount: string;
  imprisonment_term: string;
  corporate_penalty: string;
  source_section: string;
}

export interface RecordkeepingRequirement {
  retention_period: string;
  conditions: string;
  source_section: string;
}

export interface Applicability {
  entity_type: string;
  obligations: string[];
  exemptions: string[];
}

export interface Exception {
  description: string;
  source_section: string;
}

export interface CrossReference {
  reference_type: string;
  related_document: string;
  description: string;
}

// ============================================
// Legacy types for backward compatibility
// ============================================

export interface PDFDocument {
  id: string;
  filename: string;
  sourceUrl: string;
  foundOnPage: string;
  linkText: string;
  title: string;
  fileSize: number;
  scrapedAt: string;
  lastModified?: string;
  pageCount: number;
  fullText?: string;
  complianceSections: ComplianceSection[];
  metadata: PDFMetadata;
  status: 'success' | 'partial' | 'failed';
  error?: string;
}

export interface PDFMetadata {
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  keywords?: string;
  subject?: string;
}

export interface ComplianceSection {
  title: string;
  content: string;
  pageNumber?: number;
  category: ComplianceCategory;
  importance: 'high' | 'medium' | 'low';
  references: string[];
}

export type ComplianceCategory =
  | 'AML'
  | 'CFT'
  | 'KYC'
  | 'CDD'
  | 'STR'
  | 'RBA'
  | 'SANCTIONS'
  | 'PEP'
  | 'RECORD_KEEPING'
  | 'TRAINING'
  | 'GOVERNANCE'
  | 'OTHER';

export interface ScrapingStats {
  pagesVisited: number;
  pdfsFound: number;
  pdfsDownloaded: number;
  pdfsProcessed: number;
  pdfsFailed: number;
  totalTextExtracted: number;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface PDFLink {
  url: string;
  linkText: string;
  foundOnPage: string;
}
