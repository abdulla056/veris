import { NextRequest, NextResponse } from 'next/server';
import { ComplianceGapAnalyzer } from '@/lib/compliance-gap-analyzer';
import type { WebScrapeData, ProductSpec, ProductPolicy } from '@/lib/types/compliance';

/**
 * POST /api/compliance/analyze
 * Analyzes compliance gaps between regulations and product/policy documents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { regulations, productSpec, productPolicy } = body as {
      regulations: WebScrapeData;
      productSpec: ProductSpec;
      productPolicy: ProductPolicy;
    };

    // Validate required fields
    if (!regulations || !productSpec || !productPolicy) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: 'Please provide regulations, productSpec, and productPolicy'
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
      productPolicy
    );

    return NextResponse.json(result);

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
    version: '1.0.0',
    endpoints: {
      POST: {
        description: 'Analyze compliance gaps',
        body: {
          regulations: 'WebScrapeData object (regulatory requirements)',
          productSpec: 'ProductSpec object (product specifications)',
          productPolicy: 'ProductPolicy object (internal policies)',
        },
        response: 'GapAnalysisResult object with detailed findings',
      },
    },
    example_usage: {
      curl: `curl -X POST http://localhost:3000/api/compliance/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "regulations": {...},
    "productSpec": {...},
    "productPolicy": {...}
  }'`,
    },
  });
}

