/**
 * Convex Uploader - Uploads compliance data to the main project's regulations table
 */

import { log } from 'crawlee';
import { ComplianceData } from './claude-processor.js';

interface ConvexConfig {
  deploymentUrl: string; // e.g., "https://diligent-cardinal-39.convex.cloud"
}

interface ComplianceResult {
  filename: string;
  sourceUrl: string;
  compliance: ComplianceData | null;
  status: string;
}

/**
 * Transform ComplianceData to regulations table format (snake_case keys)
 * Matches the schema in /convex/schema.ts - regulations table
 */
function transformToRegulationsFormat(
  result: ComplianceResult
): Record<string, unknown> | null {
  if (!result.compliance) return null;

  const c = result.compliance;

  return {
    // Core fields
    act_name: c.act_name || '',
    jurisdiction: c.jurisdiction || 'Malaysia',
    version: c.version || '',
    last_updated: c.last_updated || '',
    
    // Definitions
    definitions: (c.definitions || []).map((d) => ({
      term: d.term || '',
      meaning: d.meaning || '',
      source_section: d.source_section || '',
    })),
    
    // Obligations
    obligations: (c.obligations || []).map((o) => ({
      name: o.name || '',
      description: o.description || '',
      applies_to: o.applies_to || [],
      source_section: o.source_section || '',
      risk_level: o.risk_level || '',
    })),
    
    // Procedures
    procedures: (c.procedures || []).map((p) => ({
      name: p.name || '',
      steps: p.steps || [],
      conditions: p.conditions || '',
      source_section: p.source_section || '',
    })),
    
    // Offences
    offences: (c.offences || []).map((o) => ({
      offence: o.offence || '',
      description: o.description || '',
      source_section: o.source_section || '',
    })),
    
    // Penalties
    penalties: (c.penalties || []).map((p) => ({
      offence: p.offence || '',
      fine_amount: p.fine_amount || '',
      imprisonment_term: p.imprisonment_term || '',
      corporate_penalty: p.corporate_penalty || '',
      source_section: p.source_section || '',
    })),
    
    // Recordkeeping
    recordkeeping_requirements: {
      retention_period: c.recordkeeping_requirements?.retention_period || '',
      conditions: c.recordkeeping_requirements?.conditions || '',
      source_section: c.recordkeeping_requirements?.source_section || '',
    },
    
    // Applicability
    applicability: (c.applicability || []).map((a) => ({
      entity_type: a.entity_type || '',
      obligations: a.obligations || [],
      exemptions: a.exemptions || [],
    })),
    
    // Exceptions
    exceptions: (c.exceptions || []).map((e) => ({
      description: e.description || '',
      source_section: e.source_section || '',
    })),
    
    // Cross references
    cross_references: (c.cross_references || []).map((cr) => ({
      reference_type: cr.reference_type || '',
      related_document: cr.related_document || '',
      description: cr.description || '',
    })),
    
    // Metadata fields
    source_url: result.sourceUrl || '',
    scraped_at: new Date().toISOString(),
    pdf_filename: result.filename || '',
  };
}

/**
 * Upload compliance data to Convex regulations table using HTTP API
 */
export async function uploadToConvex(
  results: ComplianceResult[],
  config: ConvexConfig
): Promise<{ uploaded: number; failed: number; errors: string[] }> {
  const stats = { uploaded: 0, failed: 0, errors: [] as string[] };

  if (!config.deploymentUrl) {
    log.error('CONVEX_URL not provided - skipping Convex upload');
    return stats;
  }

  log.info(`Uploading ${results.length} regulations to Convex...`);

  for (const result of results) {
    if (result.status !== 'success' || !result.compliance) {
      log.info(`Skipping ${result.filename} - status: ${result.status}`);
      continue;
    }

    try {
      const regulationData = transformToRegulationsFormat(result);
      if (!regulationData) {
        log.warning(`Failed to transform ${result.filename}`);
        stats.failed++;
        continue;
      }

      // Call regulations:create mutation via HTTP API
      const response = await fetch(`${config.deploymentUrl}/api/mutation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: 'regulations:create',
          args: regulationData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      log.info(`✓ Uploaded to regulations table: ${result.filename} (id: ${responseData})`);
      stats.uploaded++;

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      log.error(`Failed to upload ${result.filename} to Convex: ${msg}`);
      stats.errors.push(`${result.filename}: ${msg}`);
      stats.failed++;
    }
  }

  log.info(`Convex upload complete: ${stats.uploaded} uploaded, ${stats.failed} failed`);
  return stats;
}

/**
 * Alternative: Upload using Convex client (requires proper setup)
 */
export async function uploadWithConvexClient(
  results: ComplianceResult[],
  deployUrl: string
): Promise<{ uploaded: number; failed: number }> {
  // Dynamic import to avoid issues if convex is not configured
  const { ConvexHttpClient } = await import('convex/browser');
  
  const client = new ConvexHttpClient(deployUrl);
  const stats = { uploaded: 0, failed: 0 };

  for (const result of results) {
    if (result.status !== 'success' || !result.compliance) continue;

    try {
      const regulationData = transformToRegulationsFormat(result);
      if (!regulationData) {
        stats.failed++;
        continue;
      }

      // Use the regulations:create mutation
      await client.mutation('regulations:create' as any, regulationData as any);
      log.info(`✓ Uploaded: ${result.filename}`);
      stats.uploaded++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      log.error(`Upload failed for ${result.filename}: ${msg}`);
      stats.failed++;
    }
  }

  return stats;
}
