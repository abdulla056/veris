/**
 * PDF Text Extraction and Compliance Analysis Module
 * Extracts structured compliance data from regulatory PDFs
 */

import pdf from 'pdf-parse';
import { 
  ComplianceDocument,
  ComplianceData,
  Definition,
  Obligation,
  Procedure,
  Offence,
  Penalty,
  RecordkeepingRequirement,
  Applicability,
  Exception,
  CrossReference
} from './types.js';
import { createHash } from 'crypto';

/**
 * Generate a unique ID for a PDF document
 */
export function generateDocumentId(url: string, filename: string): string {
  const hash = createHash('md5').update(`${url}-${filename}`).digest('hex');
  return hash.substring(0, 12);
}

/**
 * Extract text and structured compliance data from a PDF buffer
 */
export async function extractPdfContent(
  pdfBuffer: Buffer,
  sourceUrl: string,
  linkText: string,
  foundOnPage: string,
  extractFullText: boolean = true
): Promise<ComplianceDocument> {
  const filename = extractFilename(sourceUrl);
  const documentId = generateDocumentId(sourceUrl, filename);
  
  const emptyCompliance: ComplianceData = {
    act_name: '',
    jurisdiction: 'Malaysia',
    version: '',
    last_updated: '',
    definitions: [],
    obligations: [],
    procedures: [],
    offences: [],
    penalties: [],
    recordkeeping_requirements: { retention_period: '', conditions: '', source_section: '' },
    applicability: [],
    exceptions: [],
    cross_references: []
  };

  const baseDocument: ComplianceDocument = {
    id: documentId,
    filename,
    sourceUrl,
    foundOnPage,
    linkText,
    fileSize: pdfBuffer.length,
    scrapedAt: new Date().toISOString(),
    pageCount: 0,
    status: 'success',
    compliance: emptyCompliance
  };

  try {
    console.log(`Extracting content from PDF: ${filename} (${pdfBuffer.length} bytes)`);
    
    const pdfData = await pdf(pdfBuffer);
    
    console.log(`PDF parsed: ${pdfData.numpages} pages, ${pdfData.text?.length || 0} chars of text`);
    
    // Clean the extracted text
    const rawText = pdfData.text || '';
    const cleanedText = cleanExtractedText(rawText);
    
    console.log(`Cleaned text length: ${cleanedText.length} chars`);

    // Extract act name and metadata
    const actName = extractActName(cleanedText, linkText, filename);
    const version = extractVersion(cleanedText);
    const lastUpdated = extractLastUpdated(cleanedText, pdfData.info);

    // Extract structured compliance data
    const compliance: ComplianceData = {
      act_name: actName,
      jurisdiction: 'Malaysia',
      version: version,
      last_updated: lastUpdated,
      definitions: extractDefinitions(cleanedText),
      obligations: extractObligations(cleanedText),
      procedures: extractProcedures(cleanedText),
      offences: extractOffences(cleanedText),
      penalties: extractPenalties(cleanedText),
      recordkeeping_requirements: extractRecordkeeping(cleanedText),
      applicability: extractApplicability(cleanedText),
      exceptions: extractExceptions(cleanedText),
      cross_references: extractCrossReferences(cleanedText)
    };

    console.log(`Extracted: ${compliance.definitions.length} definitions, ${compliance.obligations.length} obligations, ${compliance.offences.length} offences, ${compliance.penalties.length} penalties`);

    return {
      ...baseDocument,
      pageCount: pdfData.numpages,
      fullText: extractFullText ? cleanedText : undefined,
      compliance,
      status: 'success'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to extract PDF content from ${sourceUrl}: ${errorMessage}`);
    
    return {
      ...baseDocument,
      status: 'failed',
      error: errorMessage,
      compliance: emptyCompliance
    };
  }
}

/**
 * Clean extracted text
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Extract filename from URL
 */
function extractFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Get the .pdf filename from path
    const pdfMatch = pathname.match(/([^/]+\.pdf)/i);
    if (pdfMatch) {
      return decodeURIComponent(pdfMatch[1]);
    }
    return pathname.split('/').pop() || 'unknown.pdf';
  } catch {
    return 'unknown.pdf';
  }
}

/**
 * Extract act name from text
 */
function extractActName(text: string, linkText: string, filename: string): string {
  // Look for common act name patterns
  const actPatterns = [
    /Anti-Money Laundering[^.]*Act\s*\d{4}/gi,
    /AMLA\s*\d{4}/gi,
    /(The\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+Act\s+\d{4}/g,
    /Act\s+\d{3,4}/gi
  ];

  for (const pattern of actPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  // Check link text
  if (linkText && linkText.toLowerCase().includes('act')) {
    return linkText;
  }

  // Infer from filename
  const nameFromFile = filename.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
  if (nameFromFile.toLowerCase().includes('act') || nameFromFile.toLowerCase().includes('amla')) {
    return nameFromFile;
  }

  return linkText || nameFromFile || 'Unknown Act';
}

/**
 * Extract version from text
 */
function extractVersion(text: string): string {
  const versionPatterns = [
    /version\s*:?\s*([\d.]+)/i,
    /v([\d.]+)/i,
    /revision\s*:?\s*([\d.]+)/i,
    /as\s+(?:at|of)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
  ];

  for (const pattern of versionPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return '';
}

/**
 * Extract last updated date
 */
function extractLastUpdated(text: string, pdfInfo: any): string {
  // Try PDF metadata first
  if (pdfInfo?.ModDate) {
    return pdfInfo.ModDate;
  }
  if (pdfInfo?.CreationDate) {
    return pdfInfo.CreationDate;
  }

  // Look for date patterns in text
  const datePatterns = [
    /(?:last\s+)?(?:updated|amended|revised)\s*(?:on|:)?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(?:effective|in\s+force)\s+(?:from|since)?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return '';
}

/**
 * Extract definitions from text
 */
function extractDefinitions(text: string): Definition[] {
  const definitions: Definition[] = [];
  
  // Pattern for "term" means/refers to definitions
  const defPatterns = [
    /"([^"]+)"\s+means?\s+([^;.]+[;.])/gi,
    /"([^"]+)"\s+(?:refers?\s+to|includes?)\s+([^;.]+[;.])/gi,
    /["']([^"']+)["']\s*[-–—]\s*([^;.]+[;.])/gi,
    /\(([a-z])\)\s+"([^"]+)"\s+means?\s+([^;]+)/gi
  ];

  // Also look for INTERPRETATION or DEFINITIONS section
  const defSectionMatch = text.match(/(?:INTERPRETATION|DEFINITIONS?)[^\n]*\n([\s\S]*?)(?=\n(?:PART|CHAPTER|SECTION|\d+\.))/i);
  const searchText = defSectionMatch ? defSectionMatch[1] : text.substring(0, 50000);

  for (const pattern of defPatterns) {
    let match;
    while ((match = pattern.exec(searchText)) !== null) {
      const term = match[1]?.trim();
      const meaning = (match[2] || match[3])?.trim();
      
      if (term && meaning && term.length < 100 && meaning.length > 10) {
        // Check for duplicates
        if (!definitions.some(d => d.term.toLowerCase() === term.toLowerCase())) {
          definitions.push({
            term,
            meaning: meaning.substring(0, 1000),
            source_section: findSourceSection(text, match[0])
          });
        }
      }
    }
  }

  return definitions.slice(0, 100); // Limit to 100 definitions
}

/**
 * Extract obligations from text
 */
function extractObligations(text: string): Obligation[] {
  const obligations: Obligation[] = [];
  
  // Obligation indicators
  const obligationPatterns = [
    /(?:shall|must|required\s+to|obliged?\s+to)\s+([^.]+\.)/gi,
    /(?:it\s+is\s+)?(?:mandatory|compulsory)\s+(?:for|that)\s+([^.]+\.)/gi,
    /(?:reporting\s+)?(?:institution|entity)\s+(?:shall|must)\s+([^.]+\.)/gi
  ];

  for (const pattern of obligationPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const description = match[1]?.trim();
      if (description && description.length > 20 && description.length < 500) {
        const sourceSection = findSourceSection(text, match[0]);
        const riskLevel = assessRiskLevel(description);
        const appliesTo = extractAppliesTo(description);

        obligations.push({
          name: extractObligationName(description),
          description: description,
          applies_to: appliesTo,
          source_section: sourceSection,
          risk_level: riskLevel
        });
      }
    }
  }

  // Remove duplicates
  const unique = obligations.filter((o, i, arr) => 
    arr.findIndex(x => x.description.substring(0, 50) === o.description.substring(0, 50)) === i
  );

  return unique.slice(0, 50);
}

/**
 * Extract procedures from text
 */
function extractProcedures(text: string): Procedure[] {
  const procedures: Procedure[] = [];
  
  // Look for numbered steps or procedure descriptions
  const procedurePatterns = [
    /procedure\s+for\s+([^:.\n]+)[:\n]\s*([\s\S]*?)(?=\n\n|\n(?:PART|CHAPTER|SECTION|\d+\.))/gi,
    /(?:the\s+)?(?:following\s+)?steps?\s+(?:shall|must|should)\s+be\s+(?:taken|followed)[:\n]\s*([\s\S]*?)(?=\n\n)/gi
  ];

  for (const pattern of procedurePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1]?.trim() || 'Procedure';
      const stepsText = match[2] || match[1];
      const steps = extractSteps(stepsText);
      
      if (steps.length > 0) {
        procedures.push({
          name: name.substring(0, 200),
          steps,
          conditions: '',
          source_section: findSourceSection(text, match[0])
        });
      }
    }
  }

  return procedures.slice(0, 30);
}

/**
 * Extract offences from text
 */
function extractOffences(text: string): Offence[] {
  const offences: Offence[] = [];
  
  const offencePatterns = [
    /(?:commits?\s+an?\s+)?offence[^.]*(?:if|when|where)\s+([^.]+\.)/gi,
    /(?:it\s+is|shall\s+be)\s+an?\s+offence\s+(?:for\s+[^.]+\s+)?to\s+([^.]+\.)/gi,
    /(?:guilty\s+of\s+an?\s+)?offence\s+(?:under|punishable)[^.]*\.([^.]+\.)?/gi,
    /(?:any\s+person\s+who)\s+([^.]+)\s+commits?\s+an?\s+offence/gi
  ];

  for (const pattern of offencePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const description = match[1]?.trim() || match[0]?.trim();
      if (description && description.length > 20) {
        offences.push({
          offence: extractOffenceName(description),
          description: description.substring(0, 500),
          source_section: findSourceSection(text, match[0])
        });
      }
    }
  }

  // Remove duplicates
  const unique = offences.filter((o, i, arr) => 
    arr.findIndex(x => x.description.substring(0, 50) === o.description.substring(0, 50)) === i
  );

  return unique.slice(0, 50);
}

/**
 * Extract penalties from text
 */
function extractPenalties(text: string): Penalty[] {
  const penalties: Penalty[] = [];
  
  const penaltyPatterns = [
    /(?:liable|subject)\s+(?:to|on\s+conviction)[^.]*(?:fine|imprisonment|penalty)[^.]*\./gi,
    /(?:punishable|penalty)[^.]*(?:fine\s+not\s+exceeding|imprisonment)[^.]*\./gi,
    /(?:fine|fined)\s+(?:not\s+exceeding\s+)?(?:RM|MYR)?\s*([\d,]+)[^.]*(?:imprisonment[^.]*)?/gi,
    /imprisonment\s+(?:for\s+a\s+term\s+)?(?:not\s+exceeding\s+)?(\d+)\s*(?:years?|months?)/gi
  ];

  for (const pattern of penaltyPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const fullMatch = match[0];
      const fine = extractFineAmount(fullMatch);
      const imprisonment = extractImprisonment(fullMatch);
      const corporate = extractCorporatePenalty(fullMatch);

      if (fine || imprisonment || corporate) {
        penalties.push({
          offence: findRelatedOffence(text, match.index),
          fine_amount: fine,
          imprisonment_term: imprisonment,
          corporate_penalty: corporate,
          source_section: findSourceSection(text, fullMatch)
        });
      }
    }
  }

  // Remove duplicates
  const unique = penalties.filter((p, i, arr) => 
    arr.findIndex(x => 
      x.fine_amount === p.fine_amount && 
      x.imprisonment_term === p.imprisonment_term
    ) === i
  );

  return unique.slice(0, 50);
}

/**
 * Extract recordkeeping requirements
 */
function extractRecordkeeping(text: string): RecordkeepingRequirement {
  const result: RecordkeepingRequirement = {
    retention_period: '',
    conditions: '',
    source_section: ''
  };

  // Look for retention period
  const retentionPatterns = [
    /(?:retain|keep|maintain)\s+(?:records?|documents?)[^.]*(?:for\s+)?(?:a\s+period\s+of\s+)?(\d+)\s*years?/gi,
    /(?:records?|documents?)\s+(?:shall|must|should)\s+be\s+(?:retained|kept|maintained)\s+(?:for\s+)?(?:a\s+period\s+of\s+)?(\d+)\s*years?/gi,
    /retention\s+period[^.]*(\d+)\s*years?/gi
  ];

  for (const pattern of retentionPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.retention_period = match[0];
      result.source_section = findSourceSection(text, match[0]);
      break;
    }
  }

  // Look for conditions
  const conditionMatch = text.match(/(?:records?|documents?)[^.]*(?:shall|must|should)[^.]*(?:include|contain)[^.]+\./i);
  if (conditionMatch) {
    result.conditions = conditionMatch[0].substring(0, 500);
  }

  return result;
}

/**
 * Extract applicability information
 */
function extractApplicability(text: string): Applicability[] {
  const applicability: Applicability[] = [];
  
  const entityTypes = [
    'financial institution',
    'reporting institution', 
    'bank',
    'insurance',
    'money service business',
    'designated non-financial business',
    'DNFBP',
    'securities',
    'capital market'
  ];

  for (const entityType of entityTypes) {
    const regex = new RegExp(`${entityType}[^.]*(?:shall|must|required)[^.]+\\.`, 'gi');
    const matches = text.match(regex);
    
    if (matches && matches.length > 0) {
      const obligations = matches.map(m => m.substring(0, 200));
      applicability.push({
        entity_type: entityType,
        obligations: obligations.slice(0, 10),
        exemptions: []
      });
    }
  }

  return applicability;
}

/**
 * Extract exceptions from text
 */
function extractExceptions(text: string): Exception[] {
  const exceptions: Exception[] = [];
  
  const exceptionPatterns = [
    /(?:this\s+)?(?:section|act|part)\s+(?:does\s+not|shall\s+not)\s+apply\s+(?:to\s+)?([^.]+\.)/gi,
    /(?:exempt|excepted|excluded)\s+from\s+([^.]+\.)/gi,
    /(?:notwithstanding|except\s+(?:where|when|for))\s+([^.]+\.)/gi
  ];

  for (const pattern of exceptionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const description = match[1]?.trim() || match[0]?.trim();
      if (description && description.length > 20) {
        exceptions.push({
          description: description.substring(0, 500),
          source_section: findSourceSection(text, match[0])
        });
      }
    }
  }

  return exceptions.slice(0, 30);
}

/**
 * Extract cross references from text
 */
function extractCrossReferences(text: string): CrossReference[] {
  const crossRefs: CrossReference[] = [];
  
  const refPatterns = [
    /(?:under|pursuant\s+to|in\s+accordance\s+with)\s+(?:the\s+)?([A-Z][^,.\n]+(?:Act|Regulation|Guideline|Circular)[^,.\n]*)/gi,
    /(?:read\s+together\s+with|subject\s+to)\s+(?:the\s+)?([A-Z][^,.\n]+(?:Act|Regulation|Guideline)[^,.\n]*)/gi
  ];

  for (const pattern of refPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const relatedDoc = match[1]?.trim();
      if (relatedDoc && relatedDoc.length > 5 && relatedDoc.length < 200) {
        crossRefs.push({
          reference_type: relatedDoc.includes('Act') ? 'Legislation' : 
                          relatedDoc.includes('Regulation') ? 'Regulation' : 'Guideline',
          related_document: relatedDoc,
          description: ''
        });
      }
    }
  }

  // Remove duplicates
  const unique = crossRefs.filter((r, i, arr) => 
    arr.findIndex(x => x.related_document === r.related_document) === i
  );

  return unique.slice(0, 20);
}

// ============================================
// Helper Functions
// ============================================

function findSourceSection(text: string, matchedText: string): string {
  const index = text.indexOf(matchedText);
  if (index === -1) return '';

  // Look backwards for section number
  const beforeText = text.substring(Math.max(0, index - 500), index);
  const sectionMatch = beforeText.match(/(?:Section|SECTION|Part|PART|Chapter|CHAPTER)\s*(\d+[A-Za-z]?)/g);
  
  if (sectionMatch) {
    return sectionMatch[sectionMatch.length - 1];
  }

  return '';
}

function extractSteps(text: string): string[] {
  const steps: string[] = [];
  
  // Look for numbered items
  const numberedPattern = /(?:^|\n)\s*(?:\(([a-z]|[ivx]+|\d+)\)|(\d+)\.)\s*([^\n]+)/gi;
  let match;
  while ((match = numberedPattern.exec(text)) !== null) {
    const step = match[3]?.trim();
    if (step && step.length > 10) {
      steps.push(step.substring(0, 300));
    }
  }

  return steps.slice(0, 20);
}

function assessRiskLevel(description: string): 'high' | 'medium' | 'low' | '' {
  const lower = description.toLowerCase();
  
  const highIndicators = ['must', 'shall', 'criminal', 'offence', 'penalty', 'imprisonment', 'sanction'];
  const mediumIndicators = ['should', 'expected', 'recommended'];
  
  for (const indicator of highIndicators) {
    if (lower.includes(indicator)) return 'high';
  }
  for (const indicator of mediumIndicators) {
    if (lower.includes(indicator)) return 'medium';
  }
  
  return 'low';
}

function extractAppliesTo(description: string): string[] {
  const entities: string[] = [];
  const lower = description.toLowerCase();
  
  const entityTypes = [
    'financial institution', 'reporting institution', 'bank',
    'insurance company', 'money service business', 'securities firm'
  ];
  
  for (const entity of entityTypes) {
    if (lower.includes(entity)) {
      entities.push(entity);
    }
  }
  
  return entities;
}

function extractObligationName(description: string): string {
  // Take first few words as name
  const words = description.split(' ').slice(0, 6).join(' ');
  return words.substring(0, 100);
}

function extractOffenceName(description: string): string {
  // Take first few meaningful words
  const words = description.split(' ').slice(0, 8).join(' ');
  return words.substring(0, 150);
}

function extractFineAmount(text: string): string {
  const fineMatch = text.match(/(?:fine|fined)\s+(?:not\s+exceeding\s+)?(?:RM|MYR)?\s*([\d,]+(?:\.\d{2})?)/i);
  if (fineMatch) {
    return `RM ${fineMatch[1]}`;
  }
  return '';
}

function extractImprisonment(text: string): string {
  const imprisonMatch = text.match(/imprisonment\s+(?:for\s+a\s+term\s+)?(?:not\s+exceeding\s+)?(\d+)\s*(years?|months?)/i);
  if (imprisonMatch) {
    return `${imprisonMatch[1]} ${imprisonMatch[2]}`;
  }
  return '';
}

function extractCorporatePenalty(text: string): string {
  const corpMatch = text.match(/(?:body\s+corporate|company|corporation)[^.]*(?:fine|penalty)[^.]*(?:RM|MYR)?\s*([\d,]+)/i);
  if (corpMatch) {
    return `RM ${corpMatch[1]}`;
  }
  return '';
}

function findRelatedOffence(text: string, penaltyIndex: number): string {
  // Look backwards for the related offence
  const beforeText = text.substring(Math.max(0, penaltyIndex - 1000), penaltyIndex);
  const offenceMatch = beforeText.match(/(?:commits?\s+an?\s+)?offence[^.]*(?:if|when|where)\s+([^.]{20,200})/i);
  
  if (offenceMatch) {
    return offenceMatch[1].substring(0, 150);
  }
  
  return '';
}

/**
 * Summarize compliance data
 */
export function summarizeCompliance(documents: ComplianceDocument[]): {
  totalDocuments: number;
  totalDefinitions: number;
  totalObligations: number;
  totalOffences: number;
  totalPenalties: number;
  actsCovered: string[];
} {
  const actsCovered = new Set<string>();
  let totalDefinitions = 0;
  let totalObligations = 0;
  let totalOffences = 0;
  let totalPenalties = 0;

  for (const doc of documents) {
    if (doc.compliance.act_name) {
      actsCovered.add(doc.compliance.act_name);
    }
    totalDefinitions += doc.compliance.definitions.length;
    totalObligations += doc.compliance.obligations.length;
    totalOffences += doc.compliance.offences.length;
    totalPenalties += doc.compliance.penalties.length;
  }

  return {
    totalDocuments: documents.length,
    totalDefinitions,
    totalObligations,
    totalOffences,
    totalPenalties,
    actsCovered: Array.from(actsCovered)
  };
}
