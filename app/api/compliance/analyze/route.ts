import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { ComplianceGapAnalyzer } from '@/lib/compliance-gap-analyzer';
import type { WebScrapeData, ProductSpec, CompanyPolicySpec } from '@/lib/types/compliance';

// Initialize Convex client for server-side
const getConvexClient = () => {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return null;
  }
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
};

/**
 * POST /api/compliance/analyze
 * Analyzes compliance gaps between regulations and product/policy documents
 * Results are automatically stored in Convex database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { regulations, productSpec, companyPolicies, storeInConvex = true } = body as {
      regulations: WebScrapeData;
      productSpec: ProductSpec;
      companyPolicies: CompanyPolicySpec;
      storeInConvex?: boolean;
    };

    // Validate required fields
    if (!regulations || !productSpec || !companyPolicies) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: 'Please provide regulations, productSpec, and companyPolicies'
        },
        { status: 400 }
      );
    }

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

    // Initialize analyzer and run analysis
    const analyzer = new ComplianceGapAnalyzer();
    const result = await analyzer.analyzeGaps(
      regulations,
      productSpec,
      companyPolicies
    );

    // Store in Convex if enabled
    let convexId = null;
    let storedInConvex = false;
    
    if (storeInConvex) {
      const convex = getConvexClient();
      if (convex) {
        try {
          convexId = await convex.mutation(
            api.complianceAnalysis.createFromAnalyzerResult,
            result
          );
          storedInConvex = true;
          console.log(`✅ Analysis stored in Convex with ID: ${convexId}`);
        } catch (convexError) {
          console.error('Failed to store in Convex:', convexError);
        }
      }
    }

    return NextResponse.json({
      ...result,
      _convexId: convexId,
      _storedInConvex: storedInConvex,
    });

  } catch (error) {
    console.error('Error in compliance analysis:', error);
    
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/analyze
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    name: 'Compliance Gap Analysis API',
    description: 'Analyzes compliance gaps using semantic matching with Claude AI',
    version: '2.0.0',
    endpoints: {
      POST: {
        description: 'Analyze compliance gaps',
        body: {
          regulations: 'WebScrapeData object (regulatory requirements from web scrape)',
          productSpec: 'ProductSpec object (company product specification)',
          companyPolicies: 'CompanyPolicySpec object (internal company policies)',
        },
        response: 'GapAnalysisResult object with detailed findings',
      },
    },
    example_usage: {
      curl: `curl -X POST http://localhost:3000/api/compliance/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "regulations": { "act_name": "AMLA 2001", ... },
    "productSpec": { "companyName": "...", "productName": "...", ... },
    "companyPolicies": { "companyName": "...", "policies": [...] }
  }'`,
    },
    note: 'For wrapped JSON files (ProductSpecFile, ProductPolicyFile), unwrap before sending: productSpecFile.companyProductSpec, productPolicyFile.companyPolicySpec',
  });
}
