/**
 * Claude AI Processor for extracting structured compliance data from PDFs
 */

import Anthropic from '@anthropic-ai/sdk';
import { log } from 'crawlee';

// The JSON structure we want Claude to extract
export interface ComplianceData {
  act_name: string;
  jurisdiction: string;
  version: string;
  last_updated: string;
  definitions: Array<{
    term: string;
    meaning: string;
    source_section: string;
  }>;
  obligations: Array<{
    name: string;
    description: string;
    applies_to: string[];
    source_section: string;
    risk_level: string;
  }>;
  procedures: Array<{
    name: string;
    steps: string[];
    conditions: string;
    source_section: string;
  }>;
  offences: Array<{
    offence: string;
    description: string;
    source_section: string;
  }>;
  penalties: Array<{
    offence: string;
    fine_amount: string;
    imprisonment_term: string;
    corporate_penalty: string;
    source_section: string;
  }>;
  recordkeeping_requirements: {
    retention_period: string;
    conditions: string;
    source_section: string;
  };
  applicability: Array<{
    entity_type: string;
    obligations: string[];
    exemptions: string[];
  }>;
  exceptions: Array<{
    description: string;
    source_section: string;
  }>;
  cross_references: Array<{
    reference_type: string;
    related_document: string;
    description: string;
  }>;
}

const EXTRACTION_PROMPT = `You are an expert legal analyst specializing in Anti-Money Laundering (AML) and Counter Financing of Terrorism (CFT) regulations. 

Analyze the following regulatory document text and extract structured compliance information into the exact JSON format specified below.

**IMPORTANT INSTRUCTIONS:**
1. Extract ALL relevant information from the document
2. Include section/paragraph numbers in source_section fields
3. For penalties, extract exact amounts (e.g., "RM 5,000,000" or "5 years imprisonment")
4. For obligations, assess risk_level as "high", "medium", or "low" based on penalties and mandatory language
5. If information is not found for a field, use empty string "" or empty array []
6. Be thorough - this data will be used for compliance checking

**OUTPUT FORMAT (JSON):**
{
  "act_name": "Full name of the act/regulation",
  "jurisdiction": "Malaysia",
  "version": "Version or amendment number if mentioned",
  "last_updated": "Date if mentioned",
  "definitions": [
    {
      "term": "The defined term",
      "meaning": "The full definition",
      "source_section": "Section number"
    }
  ],
  "obligations": [
    {
      "name": "Short name for the obligation",
      "description": "Full description of what must be done",
      "applies_to": ["reporting institution", "financial institution", etc.],
      "source_section": "Section number",
      "risk_level": "high/medium/low"
    }
  ],
  "procedures": [
    {
      "name": "Procedure name",
      "steps": ["Step 1", "Step 2", etc.],
      "conditions": "When this procedure applies",
      "source_section": "Section number"
    }
  ],
  "offences": [
    {
      "offence": "Name of offence",
      "description": "What constitutes the offence",
      "source_section": "Section number"
    }
  ],
  "penalties": [
    {
      "offence": "Related offence",
      "fine_amount": "Maximum fine amount",
      "imprisonment_term": "Maximum imprisonment",
      "corporate_penalty": "Penalty for corporations",
      "source_section": "Section number"
    }
  ],
  "recordkeeping_requirements": {
    "retention_period": "How long records must be kept",
    "conditions": "What records and conditions",
    "source_section": "Section number"
  },
  "applicability": [
    {
      "entity_type": "Type of entity",
      "obligations": ["List of obligations that apply"],
      "exemptions": ["Any exemptions"]
    }
  ],
  "exceptions": [
    {
      "description": "Description of the exception",
      "source_section": "Section number"
    }
  ],
  "cross_references": [
    {
      "reference_type": "Legislation/Regulation/Guideline",
      "related_document": "Name of related document",
      "description": "How it relates"
    }
  ]
}

**DOCUMENT TEXT:**
`;

/**
 * Process PDF text with Claude to extract structured compliance data
 */
export async function processWithClaude(
  pdfText: string,
  apiKey: string,
  filename: string
): Promise<ComplianceData | null> {
  if (!apiKey) {
    log.error('ANTHROPIC_API_KEY not provided');
    return null;
  }

  if (!pdfText || pdfText.length < 100) {
    log.warning(`PDF text too short for processing: ${filename}`);
    return null;
  }

  try {
    log.info(`Processing with Claude: ${filename} (${pdfText.length} chars)`);

    const anthropic = new Anthropic({ apiKey });

    // Truncate text if too long (Claude has context limits)
    const maxChars = 150000; // Leave room for prompt and response
    const truncatedText = pdfText.length > maxChars 
      ? pdfText.substring(0, maxChars) + '\n\n[Document truncated due to length...]'
      : pdfText;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + truncatedText + '\n\n**OUTPUT JSON:**'
        }
      ]
    });

    // Extract the text response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      log.error('No JSON found in Claude response');
      return null;
    }

    const complianceData = JSON.parse(jsonMatch[0]) as ComplianceData;
    
    log.info(`Claude extracted: ${complianceData.definitions?.length || 0} definitions, ${complianceData.obligations?.length || 0} obligations, ${complianceData.offences?.length || 0} offences`);

    return complianceData;

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Claude processing failed: ${msg}`);
    return null;
  }
}

/**
 * Process multiple PDFs with Claude
 */
export async function processAllPdfs(
  pdfs: Array<{ filename: string; text: string }>,
  apiKey: string
): Promise<Array<{ filename: string; compliance: ComplianceData | null }>> {
  const results: Array<{ filename: string; compliance: ComplianceData | null }> = [];

  for (const pdf of pdfs) {
    log.info(`Processing PDF ${results.length + 1}/${pdfs.length}: ${pdf.filename}`);
    
    const compliance = await processWithClaude(pdf.text, apiKey, pdf.filename);
    results.push({ filename: pdf.filename, compliance });

    // Add delay between API calls to avoid rate limiting
    if (results.length < pdfs.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

