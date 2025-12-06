/**
 * Convex Uploader - Uploads compliance data to Convex database
 */

import { log } from 'crawlee';
import { ComplianceData } from './claude-processor.js';

interface ConvexConfig {
  deploymentUrl: string; // e.g., "https://your-deployment.convex.cloud"
}

interface ComplianceResult {
  filename: string;
  sourceUrl: string;
  compliance: ComplianceData | null;
  status: string;
}

/**
 * Transform ComplianceData to Convex format (camelCase keys)
 */
function transformToConvexFormat(
  result: ComplianceResult
): Record<string, unknown> | null {
  if (!result.compliance) return null;

  const c = result.compliance;

  return {
    filename: result.filename,
    sourceUrl: result.sourceUrl,
    processedAt: new Date().toISOString(),
    status: result.status,
    actName: c.act_name || '',
    jurisdiction: c.jurisdiction || '',
    version: c.version || '',
    lastUpdated: c.last_updated || '',
    definitions: (c.definitions || []).map((d) => ({
      term: d.term || '',
      meaning: d.meaning || '',
      sourceSection: d.source_section || '',
    })),
    obligations: (c.obligations || []).map((o) => ({
      name: o.name || '',
      description: o.description || '',
      appliesTo: o.applies_to || [],
      sourceSection: o.source_section || '',
      riskLevel: o.risk_level || '',
    })),
    procedures: (c.procedures || []).map((p) => ({
      name: p.name || '',
      steps: p.steps || [],
      conditions: p.conditions || '',
      sourceSection: p.source_section || '',
    })),
    offences: (c.offences || []).map((o) => ({
      offence: o.offence || '',
      description: o.description || '',
      sourceSection: o.source_section || '',
    })),
    penalties: (c.penalties || []).map((p) => ({
      offence: p.offence || '',
      fineAmount: p.fine_amount || '',
      imprisonmentTerm: p.imprisonment_term || '',
      corporatePenalty: p.corporate_penalty || '',
      sourceSection: p.source_section || '',
    })),
    recordkeepingRequirements: {
      retentionPeriod: c.recordkeeping_requirements?.retention_period || '',
      conditions: c.recordkeeping_requirements?.conditions || '',
      sourceSection: c.recordkeeping_requirements?.source_section || '',
    },
    applicability: (c.applicability || []).map((a) => ({
      entityType: a.entity_type || '',
      obligations: a.obligations || [],
      exemptions: a.exemptions || [],
    })),
    exceptions: (c.exceptions || []).map((e) => ({
      description: e.description || '',
      sourceSection: e.source_section || '',
    })),
    crossReferences: (c.cross_references || []).map((cr) => ({
      referenceType: cr.reference_type || '',
      relatedDocument: cr.related_document || '',
      description: cr.description || '',
    })),
  };
}

/**
 * Upload compliance data to Convex using HTTP API
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

  log.info(`Uploading ${results.length} compliance documents to Convex...`);

  for (const result of results) {
    if (result.status !== 'success' || !result.compliance) {
      log.info(`Skipping ${result.filename} - status: ${result.status}`);
      continue;
    }

    try {
      const convexData = transformToConvexFormat(result);
      if (!convexData) {
        log.warning(`Failed to transform ${result.filename}`);
        stats.failed++;
        continue;
      }

      // Call Convex mutation via HTTP API
      const response = await fetch(`${config.deploymentUrl}/api/mutation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: 'compliance:upsertComplianceDocument',
          args: convexData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      log.info(`✓ Uploaded to Convex: ${result.filename} (${responseData.action || 'success'})`);
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
 * Alternative: Upload using Convex client (requires CONVEX_DEPLOY_KEY)
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
      const convexData = transformToConvexFormat(result);
      if (!convexData) {
        stats.failed++;
        continue;
      }

      // Use the mutation function reference
      await client.mutation('compliance:upsertComplianceDocument' as any, convexData as any);
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

