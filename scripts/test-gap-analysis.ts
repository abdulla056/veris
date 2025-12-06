#!/usr/bin/env node
/**
 * Test script for Compliance Gap Analyzer
 * Demonstrates semantic matching between regulations and product/policy
 * Results are stored in Convex database
 */

import { ComplianceGapAnalyzer } from '../lib/compliance-gap-analyzer';
import type { WebScrapeData, ProductSpecFile, ProductPolicyFile } from '../lib/types/compliance';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  });
}

// Load mock data
const mockDataDir = path.join(process.cwd(), 'mock_data');

console.log('📁 Loading mock data...\n');

// WebScrapeData is already in the correct format (no wrapper)
const webScrapeData: WebScrapeData = JSON.parse(
  fs.readFileSync(path.join(mockDataDir, 'web_scrape.json'), 'utf-8')
);

// ProductSpec needs to be unwrapped from { companyProductSpec: {...} }
const productSpecFile: ProductSpecFile = JSON.parse(
  fs.readFileSync(path.join(mockDataDir, 'product_spec.json'), 'utf-8')
);
const productSpec = productSpecFile.companyProductSpec;

// ProductPolicy needs to be unwrapped from { companyPolicySpec: {...} }
const productPolicyFile: ProductPolicyFile = JSON.parse(
  fs.readFileSync(path.join(mockDataDir, 'product_policy.json'), 'utf-8')
);
const companyPolicies = productPolicyFile.companyPolicySpec;

console.log('✅ Data loaded successfully');
console.log(`   • Regulation: ${webScrapeData.act_name}`);
console.log(`   • Company: ${productSpec.companyName}`);
console.log(`   • Product: ${productSpec.productName}`);
console.log(`   • Policies: ${companyPolicies.policies.length} policies loaded`);
console.log('');

async function storeInConvex(result: ReturnType<ComplianceGapAnalyzer['analyzeGaps']> extends Promise<infer T> ? T : never) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    console.warn('⚠️  NEXT_PUBLIC_CONVEX_URL not set - skipping Convex storage');
    return null;
  }

  try {
    // Use dynamic import for ConvexHttpClient
    const { ConvexHttpClient } = await import('convex/browser');
    const convex = new ConvexHttpClient(convexUrl);
    
    // Import the API
    const { api } = await import('../convex/_generated/api');
    
    // Store in Convex
    const convexId = await convex.mutation(
      api.complianceAnalysis.createFromAnalyzerResult,
      result
    );
    
    return convexId;
  } catch (error) {
    console.error('❌ Failed to store in Convex:', error);
    return null;
  }
}

async function runAnalysis() {
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY environment variable is not set');
    console.error('');
    console.error('Please set your Anthropic API key:');
    console.error('  export ANTHROPIC_API_KEY="your-api-key-here"');
    console.error('');
    console.error('Or create a .env.local file with:');
    console.error('  ANTHROPIC_API_KEY=your-api-key-here');
    process.exit(1);
  }

  console.log('🤖 Initializing Compliance Gap Analyzer with Claude AI...\n');
  console.log('═'.repeat(70));
  
  const analyzer = new ComplianceGapAnalyzer();

  try {
    // Run the analysis
    const result = await analyzer.analyzeGaps(
      webScrapeData,
      productSpec,
      companyPolicies
    );

    console.log('\n');
    console.log('═'.repeat(70));
    console.log('\n📊 ANALYSIS COMPLETE!\n');

    // Display the report
    const report = analyzer.generateReport(result);
    console.log(report);

    // Store in Convex
    console.log('\n💾 Storing results in Convex...');
    const convexId = await storeInConvex(result);
    
    if (convexId) {
      console.log(`✅ Results stored in Convex with ID: ${convexId}`);
    } else {
      console.log('⚠️  Results not stored in Convex (see warnings above)');
    }

    // Display quick summary
    console.log('\n📈 QUICK SUMMARY:');
    console.log(`   Company: ${result.company_name}`);
    console.log(`   Product: ${result.product_name}`);
    console.log(`   Compliance Score: ${result.compliance_score}/100`);
    console.log(`   Total Gaps: ${result.summary.total_gaps}`);
    console.log(`   Critical: ${result.summary.critical_gaps} | High: ${result.summary.high_gaps} | Medium: ${result.summary.medium_gaps} | Low: ${result.summary.low_gaps}`);
    console.log('');

    if (result.compliance_score >= 90) {
      console.log('✅ Excellent compliance! Minor improvements recommended.');
    } else if (result.compliance_score >= 70) {
      console.log('⚠️  Good compliance, but several gaps need attention.');
    } else if (result.compliance_score >= 50) {
      console.log('🔶 Moderate compliance. Significant gaps require immediate action.');
    } else {
      console.log('🔴 Critical compliance issues detected. Urgent remediation required.');
    }

    // Return the result for programmatic use
    return result;

  } catch (error) {
    console.error('\n❌ Error during analysis:', error);
    process.exit(1);
  }
}

// Run the analysis
runAnalysis();
