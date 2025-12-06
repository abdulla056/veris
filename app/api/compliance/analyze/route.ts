import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Anthropic from "@anthropic-ai/sdk";

// Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Claude AI configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Gap Analysis Prompt
const GAP_ANALYSIS_PROMPT = `You are an expert compliance analyst specializing in AML/CFT regulations in Malaysia.

Compare the PRODUCT SPECIFICATION against the REGULATORY REQUIREMENTS and identify compliance gaps.

For each gap found, provide:
1. Gap ID (GAP-001, GAP-002, etc.)
2. Gap Type: "missing_feature" | "missing_policy" | "incomplete_coverage" | "misaligned_requirement"
3. Severity: "critical" | "high" | "medium" | "low"
4. The specific regulation being violated
5. Current state in the product
6. Gap description
7. Affected areas
8. Risk assessment (regulatory, financial, operational)
9. Recommendation
10. Remediation steps
11. Citation from the regulation

Return ONLY valid JSON in this EXACT format:
{
  "compliance_score": 75,
  "gaps_found": [
    {
      "gap_id": "GAP-001",
      "gap_type": "missing_feature",
      "severity": "high",
      "regulation": {
        "name": "AMLA 2001",
        "section": "Section 16",
        "requirement": "Customer Due Diligence",
        "description": "Requirement description"
      },
      "current_state": "Current product implementation",
      "gap_description": "What is missing or non-compliant",
      "affected_areas": ["KYC", "Onboarding"],
      "risk_assessment": {
        "regulatory_risk": "High - potential penalties",
        "financial_impact": "RM 5,000,000 maximum fine",
        "operational_impact": "May require system changes"
      },
      "recommendation": "Recommended action",
      "remediation_steps": ["Step 1", "Step 2"],
      "citation": "AMLA 2001, Section 16(1)",
      "confidence_score": 0.85
    }
  ],
  "summary": {
    "total_gaps": 5,
    "critical_gaps": 1,
    "high_gaps": 2,
    "medium_gaps": 1,
    "low_gaps": 1
  },
  "recommendations_summary": "Overall recommendations summary",
  "compliant_areas": ["List of areas that are compliant"],
  "next_review_date": "2025-03-01"
}

SCORING GUIDE:
- 100: Fully compliant
- 80-99: Minor gaps only
- 60-79: Some significant gaps
- 40-59: Major compliance issues
- 0-39: Critical non-compliance

Be thorough and identify ALL potential compliance gaps based on AML/CFT requirements.`;

interface GapAnalysisResult {
  compliance_score: number;
  gaps_found: Array<{
    gap_id: string;
    gap_type: string;
    severity: string;
    regulation: {
      name: string;
      section: string;
      requirement: string;
      description: string;
    };
    current_state: string;
    gap_description: string;
    affected_areas: string[];
    risk_assessment: {
      regulatory_risk: string;
      financial_impact: string;
      operational_impact: string;
    };
    recommendation: string;
    remediation_steps: string[];
    citation: string;
    confidence_score: number;
  }>;
  summary: {
    total_gaps: number;
    critical_gaps: number;
    high_gaps: number;
    medium_gaps: number;
    low_gaps: number;
  };
  recommendations_summary: string;
  compliant_areas?: string[];
  next_review_date: string;
}

/**
 * Run gap analysis with Claude
 */
async function runGapAnalysis(
  productSpec: Record<string, unknown>,
  regulations: Array<Record<string, unknown>>
): Promise<GapAnalysisResult | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log("[Claude] No API key configured");
    return null;
  }

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    // Prepare the comparison data
    const productSpecSummary = JSON.stringify(productSpec, null, 2);
    const regulationsSummary = JSON.stringify(regulations, null, 2);

    // Truncate if too long
    const maxChars = 80000;
    const truncatedProductSpec = productSpecSummary.length > maxChars / 2
      ? productSpecSummary.substring(0, maxChars / 2) + "\n...[truncated]"
      : productSpecSummary;
    const truncatedRegulations = regulationsSummary.length > maxChars / 2
      ? regulationsSummary.substring(0, maxChars / 2) + "\n...[truncated]"
      : regulationsSummary;

    console.log("[Claude] Running gap analysis...");

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `${GAP_ANALYSIS_PROMPT}

===== PRODUCT SPECIFICATION =====
${truncatedProductSpec}

===== REGULATORY REQUIREMENTS =====
${truncatedRegulations}

Analyze the product specification against these regulations and return the gap analysis JSON.`
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
      console.error('[Claude] No JSON found in response');
      return null;
    }

    const result = JSON.parse(jsonMatch[0]) as GapAnalysisResult;
    console.log('[Claude] Gap analysis complete:', {
      score: result.compliance_score,
      gaps: result.gaps_found?.length || 0,
    });

    return result;

  } catch (error) {
    console.error('[Claude] Gap analysis error:', error);
    return null;
  }
}

/**
 * Run compliance gap analysis
 * POST /api/compliance/analyze
 * Body: { productSpecId: string, regulationId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productSpecId, regulationId } = body;

    if (!productSpecId) {
      return NextResponse.json({ error: "productSpecId is required" }, { status: 400 });
    }

    console.log(`[Analysis] Starting gap analysis for productSpec: ${productSpecId}`);

    // Fetch product spec
    const productSpec = await convex.query(api.productSpecs.getById, {
      id: productSpecId as Id<"productSpecs">,
    });

    if (!productSpec) {
      return NextResponse.json({ error: "ProductSpec not found" }, { status: 404 });
    }

    console.log(`[Analysis] Loaded productSpec: ${productSpec.productName}`);

    // Fetch regulations
    let regulations;
    if (regulationId) {
      // Fetch specific regulation
      const regulation = await convex.query(api.regulations.getById, {
        id: regulationId as Id<"regulations">,
      });
      regulations = regulation ? [regulation] : [];
    } else {
      // Fetch all regulations (Malaysian jurisdiction)
      regulations = await convex.query(api.regulations.list, {
        jurisdiction: "Malaysia",
        limit: 10,
      });
    }

    if (!regulations || regulations.length === 0) {
      return NextResponse.json({ 
        error: "No regulations found. Please ensure regulations are loaded in the database." 
      }, { status: 404 });
    }

    console.log(`[Analysis] Loaded ${regulations.length} regulations`);

    // Check API key
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        error: "AI processing not configured. Please set ANTHROPIC_API_KEY." 
      }, { status: 500 });
    }

    // Run gap analysis with Claude
    const analysisResult = await runGapAnalysis(productSpec, regulations);

    if (!analysisResult) {
      return NextResponse.json({ 
        error: "Failed to run gap analysis" 
      }, { status: 500 });
    }

    // Generate audit ID
    const auditId = `AUDIT-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    // Save to complianceAnalysis table
    console.log("[Convex] Saving compliance analysis...");
    
    const analysisId = await convex.mutation(api.complianceAnalysis.createFromAnalyzerResult, {
      audit_id: auditId,
      audit_date: now.toISOString(),
      company_name: productSpec.companyName,
      product_name: productSpec.productName,
      regulation_source: regulations.map((r: any) => r.act_name).join(", "),
      compliance_score: analysisResult.compliance_score,
      gaps_found: analysisResult.gaps_found,
      summary: analysisResult.summary,
      recommendations_summary: analysisResult.recommendations_summary,
      next_review_date: analysisResult.next_review_date || now.toISOString(),
      productSpecId: productSpecId as Id<"productSpecs">,
      regulationId: regulationId ? (regulationId as Id<"regulations">) : undefined,
    });

    console.log("[Convex] Analysis saved with ID:", analysisId);

    // Return response
    return NextResponse.json({
      success: true,
      message: "Gap analysis completed successfully!",
      analysisId,
      auditId,
      result: {
        complianceScore: analysisResult.compliance_score,
        status: analysisResult.compliance_score >= 80 ? "compliant" : 
                analysisResult.compliance_score >= 50 ? "partial" : "non_compliant",
        totalGaps: analysisResult.gaps_found.length,
        summary: analysisResult.summary,
        criticalGaps: analysisResult.gaps_found.filter(g => g.severity === "critical"),
        highGaps: analysisResult.gaps_found.filter(g => g.severity === "high"),
        recommendationsSummary: analysisResult.recommendations_summary,
        compliantAreas: analysisResult.compliant_areas || [],
      },
      productSpec: {
        id: productSpecId,
        name: productSpec.productName,
        company: productSpec.companyName,
      },
      regulationsAnalyzed: regulations.map((r: any) => ({
        name: r.act_name,
        jurisdiction: r.jurisdiction,
      })),
    });
  } catch (error) {
    console.error("[Analysis] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

/**
 * Get analysis results
 * GET /api/compliance/analyze?id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const auditId = searchParams.get("auditId");
    const companyName = searchParams.get("company");

    if (id) {
      // Get specific analysis
      const analysis = await convex.query(api.complianceAnalysis.getById, {
        id: id as Id<"complianceAnalysis">,
      });
      return NextResponse.json({ success: true, analysis });
    }

    if (auditId) {
      // Get by audit ID
      const analysis = await convex.query(api.complianceAnalysis.getByAuditId, {
        auditId,
      });
      return NextResponse.json({ success: true, analysis });
    }

    if (companyName) {
      // Get all analyses for company
      const analyses = await convex.query(api.complianceAnalysis.getByCompany, {
        companyName,
      });
      return NextResponse.json({ success: true, analyses });
    }

    // List all analyses
    const analyses = await convex.query(api.complianceAnalysis.list, { limit: 50 });
    return NextResponse.json({ success: true, analyses });
  } catch (error) {
    console.error("[GET Analysis] Error:", error);
    return NextResponse.json(
      { error: "Failed to get analysis" },
      { status: 500 }
    );
  }
}
