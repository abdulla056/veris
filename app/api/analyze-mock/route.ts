import { NextResponse } from 'next/server';
import { ComplianceGapAnalyzer } from '@/lib/compliance-gap-analyzer';
import type { WebScrapeData, ProductSpec, ProductPolicy } from '@/lib/types/compliance';
import * as fs from 'fs';
import * as path from 'path';

/**
 * POST /api/analyze-mock
 * Runs semantic analysis on mock data
 */
export async function POST() {
  try {
    // Check for Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Configuration error',
          message: 'ANTHROPIC_API_KEY is not configured'
        },
        { status: 500 }
      );
    }

    // Load mock data
    const mockDataDir = path.join(process.cwd(), 'mock_data');
    
    const webScrapeData: WebScrapeData = JSON.parse(
      fs.readFileSync(path.join(mockDataDir, 'web_scrape.json'), 'utf-8')
    );
    
    const productSpec: ProductSpec = JSON.parse(
      fs.readFileSync(path.join(mockDataDir, 'product_spec.json'), 'utf-8')
    );
    
    const productPolicy: ProductPolicy = JSON.parse(
      fs.readFileSync(path.join(mockDataDir, 'product_policy.json'), 'utf-8')
    );

    // Initialize analyzer and run analysis
    const analyzer = new ComplianceGapAnalyzer();
    const result = await analyzer.analyzeGaps(
      webScrapeData,
      productSpec,
      productPolicy
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in mock analysis:', error);
    
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

