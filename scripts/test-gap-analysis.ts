#!/usr/bin/env node
/**
 * Test script for Compliance Gap Analyzer
 * Demonstrates semantic matching between regulations and product/policy
 */

import { ComplianceGapAnalyzer } from '../lib/compliance-gap-analyzer';
import type { WebScrapeData, ProductSpec, ProductPolicy } from '../lib/types/compliance';
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

const webScrapeData: WebScrapeData = JSON.parse(
  fs.readFileSync(path.join(mockDataDir, 'web_scrape.json'), 'utf-8')
);

const productSpec: ProductSpec = JSON.parse(
  fs.readFileSync(path.join(mockDataDir, 'product_spec.json'), 'utf-8')
);

const productPolicy: ProductPolicy = JSON.parse(
  fs.readFileSync(path.join(mockDataDir, 'product_policy.json'), 'utf-8')
);

console.log('✅ Data loaded successfully');
console.log(`   • Regulation: ${webScrapeData.act_name}`);
console.log(`   • Product: ${productSpec.product_name}`);
console.log(`   • Policy: ${productPolicy.policy_name}`);
console.log('');

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
      productPolicy
    );

    console.log('\n');
    console.log('═'.repeat(70));
    console.log('\n📊 ANALYSIS COMPLETE!\n');

    // Display the report
    const report = analyzer.generateReport(result);
    console.log(report);

    // Save results
    const outputDir = path.join(process.cwd(), 'analysis_results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(outputDir, `gap_analysis_${timestamp}.json`);
    const reportPath = path.join(outputDir, `gap_analysis_${timestamp}.txt`);

    fs.writeFileSync(jsonPath, analyzer.exportToJSON(result));
    fs.writeFileSync(reportPath, report);

    console.log('\n💾 Results saved:');
    console.log(`   • JSON: ${jsonPath}`);
    console.log(`   • Report: ${reportPath}`);
    console.log('');

    // Display quick summary
    console.log('📈 QUICK SUMMARY:');
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

  } catch (error) {
    console.error('\n❌ Error during analysis:', error);
    process.exit(1);
  }
}

// Run the analysis
runAnalysis();

