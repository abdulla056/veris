import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { ComplianceGapAnalyzer } from '@/lib/compliance-gap-analyzer';
import type { WebScrapeData, ProductSpecFile, ProductPolicyFile } from '@/lib/types/compliance';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Convex client for server-side
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/analyze-mock
 * Runs semantic analysis on mock data and stores results in Convex
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

    // Check for Convex URL
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      return NextResponse.json(
        { 
          error: 'Configuration error',
          message: 'NEXT_PUBLIC_CONVEX_URL is not configured'
        },
        { status: 500 }
      );
    }

    // Load mock data
    const mockDataDir = path.join(process.cwd(), 'mock_data');
    
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

    // Initialize analyzer and run analysis
    const analyzer = new ComplianceGapAnalyzer();
    const result = await analyzer.analyzeGaps(
      webScrapeData,
      productSpec,
      companyPolicies
    );

    // Store result in Convex
    try {
      const convexId = await convex.mutation(
        api.complianceAnalysis.createFromAnalyzerResult,
        result
      );
      console.log(`✅ Analysis stored in Convex with ID: ${convexId}`);
      
      // Return result with Convex ID
      return NextResponse.json({
        ...result,
        _convexId: convexId,
        _storedInConvex: true,
      });
    } catch (convexError) {
      console.error('Failed to store in Convex:', convexError);
      // Still return the result even if Convex storage fails
      return NextResponse.json({
        ...result,
        _storedInConvex: false,
        _convexError: convexError instanceof Error ? convexError.message : 'Unknown Convex error',
      });
    }

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
