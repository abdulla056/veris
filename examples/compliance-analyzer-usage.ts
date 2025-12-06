/**
 * Example: Using the Compliance Gap Analyzer
 * This shows how to integrate semantic analysis into your app
 */

import { ComplianceGapAnalyzer } from '@/lib/compliance-gap-analyzer';
import type { WebScrapeData, ProductSpec, ProductPolicy } from '@/lib/types/compliance';

// Example 1: Basic Usage
async function basicExample() {
  const analyzer = new ComplianceGapAnalyzer();

  // Your data (from API, database, or file upload)
  const regulations: WebScrapeData = {
    act_name: "AMLA 2001",
    jurisdiction: "Malaysia",
    // ... rest of data
  } as WebScrapeData;

  const productSpec: ProductSpec = {
    product_name: "My Product",
    // ... rest of data
  } as ProductSpec;

  const productPolicy: ProductPolicy = {
    policy_name: "My Policy",
    // ... rest of data
  } as ProductPolicy;

  // Run analysis
  const result = await analyzer.analyzeGaps(
    regulations,
    productSpec,
    productPolicy
  );

  console.log(`Compliance Score: ${result.compliance_score}/100`);
  console.log(`Gaps Found: ${result.summary.total_gaps}`);
}

// Example 2: With Document Upload Handler
async function uploadHandlerExample(
  regulationsFile: File,
  productSpecFile: File,
  policyFile: File
) {
  // 1. Parse uploaded files (you'd use a PDF parser)
  const regulations = await parseRegulationsFromPDF(regulationsFile);
  const productSpec = await parseProductSpecFromPDF(productSpecFile);
  const policy = await parsePolicyFromPDF(policyFile);

  // 2. Run analysis
  const analyzer = new ComplianceGapAnalyzer();
  const result = await analyzer.analyzeGaps(regulations, productSpec, policy);

  // 3. Return to frontend
  return {
    status: 'success',
    audit_id: result.audit_id,
    score: result.compliance_score,
    gaps: result.gaps_found,
    report_url: `/reports/${result.audit_id}`,
  };
}

// Example 3: API Route Integration
export async function POST(request: Request) {
  const body = await request.json();

  try {
    const analyzer = new ComplianceGapAnalyzer();
    const result = await analyzer.analyzeGaps(
      body.regulations,
      body.productSpec,
      body.productPolicy
    );

    // Save to database
    await saveAuditResult(result);

    // Return response
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: 'Analysis failed', details: error.message },
      { status: 500 }
    );
  }
}

// Example 4: Generate and Save Report
async function generateReportExample() {
  const analyzer = new ComplianceGapAnalyzer();

  // Run analysis
  const result = await analyzer.analyzeGaps(
    regulations,
    productSpec,
    productPolicy
  );

  // Generate human-readable report
  const textReport = analyzer.generateReport(result);

  // Generate JSON export
  const jsonReport = analyzer.exportToJSON(result);

  // Save to files
  await fs.writeFile(`reports/${result.audit_id}.txt`, textReport);
  await fs.writeFile(`reports/${result.audit_id}.json`, jsonReport);

  return result;
}

// Example 5: Real-time Progress Updates
async function progressUpdatesExample() {
  const analyzer = new ComplianceGapAnalyzer();

  // You can wrap the analyzer to emit progress
  const obligations = regulations.obligations;

  for (let i = 0; i < obligations.length; i++) {
    console.log(`Analyzing ${i + 1}/${obligations.length}: ${obligations[i].name}`);

    // Update UI with progress
    await emitProgress({
      current: i + 1,
      total: obligations.length,
      currentObligation: obligations[i].name,
    });
  }

  const result = await analyzer.analyzeGaps(
    regulations,
    productSpec,
    productPolicy
  );

  return result;
}

// Example 6: Filtering Results by Severity
async function filterBySeverityExample() {
  const analyzer = new ComplianceGapAnalyzer();
  const result = await analyzer.analyzeGaps(
    regulations,
    productSpec,
    productPolicy
  );

  // Get only critical and high severity gaps
  const urgentGaps = result.gaps_found.filter(
    gap => gap.severity === 'critical' || gap.severity === 'high'
  );

  // Send alerts for urgent gaps
  if (urgentGaps.length > 0) {
    await sendAlertEmail({
      to: 'compliance@company.com',
      subject: `⚠️ ${urgentGaps.length} Urgent Compliance Gaps Detected`,
      gaps: urgentGaps,
    });
  }

  return { urgentGaps, allGaps: result.gaps_found };
}

// Example 7: Batch Analysis of Multiple Products
async function batchAnalysisExample() {
  const analyzer = new ComplianceGapAnalyzer();

  const products = [
    { name: 'Product A', spec: productSpecA, policy: policyA },
    { name: 'Product B', spec: productSpecB, policy: policyB },
    { name: 'Product C', spec: productSpecC, policy: policyC },
  ];

  const results = [];

  for (const product of products) {
    console.log(`Analyzing ${product.name}...`);

    const result = await analyzer.analyzeGaps(
      regulations,
      product.spec,
      product.policy
    );

    results.push({
      product: product.name,
      score: result.compliance_score,
      gaps: result.summary.total_gaps,
      critical: result.summary.critical_gaps,
    });
  }

  // Generate comparative report
  console.log('\n=== BATCH ANALYSIS RESULTS ===');
  results.forEach(r => {
    console.log(`${r.product}: ${r.score}/100 (${r.gaps} gaps, ${r.critical} critical)`);
  });

  return results;
}

// Helper functions (you'd implement these)
async function parseRegulationsFromPDF(file: File): Promise<WebScrapeData> {
  // Use PDF parser, then structure data
  throw new Error('Not implemented');
}

async function parseProductSpecFromPDF(file: File): Promise<ProductSpec> {
  throw new Error('Not implemented');
}

async function parsePolicyFromPDF(file: File): Promise<ProductPolicy> {
  throw new Error('Not implemented');
}

async function saveAuditResult(result: any) {
  // Save to your database
  throw new Error('Not implemented');
}

async function emitProgress(progress: any) {
  // Send via WebSocket or Server-Sent Events
  console.log('Progress:', progress);
}

async function sendAlertEmail(options: any) {
  // Send email via SendGrid, etc.
  console.log('Alert sent:', options);
}

// Export examples
export {
  basicExample,
  uploadHandlerExample,
  generateReportExample,
  progressUpdatesExample,
  filterBySeverityExample,
  batchAnalysisExample,
};

