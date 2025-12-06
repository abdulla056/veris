import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Validators (matching GapAnalysisResult type)
// ============================================

const regulationInfoValidator = v.object({
  name: v.string(),
  section: v.string(),
  requirement: v.string(),
  description: v.string(),
});

const riskAssessmentValidator = v.object({
  regulatoryRisk: v.string(),
  financialImpact: v.string(),
  operationalImpact: v.string(),
});

const gapValidator = v.object({
  gapId: v.string(),
  gapType: v.string(), // "missing_feature" | "missing_policy" | "incomplete_coverage" | "misaligned_requirement"
  severity: v.string(), // "critical" | "high" | "medium" | "low"
  regulation: regulationInfoValidator,
  currentState: v.string(),
  gapDescription: v.string(),
  affectedAreas: v.array(v.string()),
  riskAssessment: riskAssessmentValidator,
  recommendation: v.string(),
  remediationSteps: v.array(v.string()),
  citation: v.string(),
  confidenceScore: v.number(),
});

const summaryValidator = v.object({
  totalGaps: v.number(),
  criticalGaps: v.number(),
  highGaps: v.number(),
  mediumGaps: v.number(),
  lowGaps: v.number(),
});

// ============================================
// Queries
// ============================================

export const list = query({
  args: {
    status: v.optional(v.string()),
    companyName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.status) {
      return await ctx.db
        .query("complianceAnalysis")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    }

    if (args.companyName) {
      return await ctx.db
        .query("complianceAnalysis")
        .withIndex("by_company", (q) => q.eq("companyName", args.companyName!))
        .order("desc")
        .take(limit);
    }

    return await ctx.db.query("complianceAnalysis").order("desc").take(limit);
  },
});

export const getById = query({
  args: { id: v.id("complianceAnalysis") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByAuditId = query({
  args: { auditId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complianceAnalysis")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first();
  },
});

export const getByCompany = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complianceAnalysis")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .order("desc")
      .collect();
  },
});

export const getByProduct = query({
  args: { productName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complianceAnalysis")
      .withIndex("by_product", (q) => q.eq("productName", args.productName))
      .order("desc")
      .collect();
  },
});

export const getLatestForCompany = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complianceAnalysis")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .order("desc")
      .first();
  },
});

export const getGapsBySeverity = query({
  args: {
    id: v.id("complianceAnalysis"),
    severity: v.string(),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.id);
    if (!analysis) return [];

    return analysis.gapsFound.filter(
      (g) => g.severity.toLowerCase() === args.severity.toLowerCase()
    );
  },
});

export const getCriticalGaps = query({
  args: { id: v.id("complianceAnalysis") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.id);
    if (!analysis) return [];

    return analysis.gapsFound.filter(
      (g) =>
        g.severity.toLowerCase() === "critical" ||
        g.severity.toLowerCase() === "high"
    );
  },
});

export const getComplianceScoreHistory = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query("complianceAnalysis")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .order("desc")
      .collect();

    return analyses.map((a) => ({
      auditId: a.auditId,
      auditDate: a.auditDate,
      productName: a.productName,
      complianceScore: a.complianceScore,
      status: a.status,
      totalGaps: a.summary.totalGaps,
    }));
  },
});

// ============================================
// Mutations
// ============================================

export const create = mutation({
  args: {
    auditId: v.string(),
    auditDate: v.string(),
    companyName: v.string(),
    productName: v.string(),
    regulationSource: v.string(),
    complianceScore: v.number(),
    status: v.string(),
    gapsFound: v.array(gapValidator),
    summary: summaryValidator,
    recommendationsSummary: v.string(),
    nextReviewDate: v.string(),
    // Optional references
    productSpecId: v.optional(v.id("productSpecs")),
    companyPoliciesId: v.optional(v.id("companyPolicies")),
    regulationId: v.optional(v.id("regulations")),
    // Metadata
    aiModel: v.optional(v.string()),
    analysisVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("complianceAnalysis", args);
    return id;
  },
});

// Create from GapAnalysisResult (direct from analyzer output)
export const createFromAnalyzerResult = mutation({
  args: {
    // The analyzer result fields (using snake_case to match analyzer output)
    audit_id: v.string(),
    audit_date: v.string(),
    company_name: v.string(),
    product_name: v.string(),
    regulation_source: v.string(),
    compliance_score: v.number(),
    gaps_found: v.array(
      v.object({
        gap_id: v.string(),
        gap_type: v.string(),
        severity: v.string(),
        regulation: v.object({
          name: v.string(),
          section: v.string(),
          requirement: v.string(),
          description: v.string(),
        }),
        current_state: v.string(),
        gap_description: v.string(),
        affected_areas: v.array(v.string()),
        risk_assessment: v.object({
          regulatory_risk: v.string(),
          financial_impact: v.string(),
          operational_impact: v.string(),
        }),
        recommendation: v.string(),
        remediation_steps: v.array(v.string()),
        citation: v.string(),
        confidence_score: v.number(),
      })
    ),
    summary: v.object({
      total_gaps: v.number(),
      critical_gaps: v.number(),
      high_gaps: v.number(),
      medium_gaps: v.number(),
      low_gaps: v.number(),
    }),
    recommendations_summary: v.string(),
    next_review_date: v.string(),
    // Optional references
    productSpecId: v.optional(v.id("productSpecs")),
    companyPoliciesId: v.optional(v.id("companyPolicies")),
    regulationId: v.optional(v.id("regulations")),
  },
  handler: async (ctx, args) => {
    // Transform snake_case to camelCase for storage
    const transformedGaps = args.gaps_found.map((gap) => ({
      gapId: gap.gap_id,
      gapType: gap.gap_type,
      severity: gap.severity,
      regulation: gap.regulation,
      currentState: gap.current_state,
      gapDescription: gap.gap_description,
      affectedAreas: gap.affected_areas,
      riskAssessment: {
        regulatoryRisk: gap.risk_assessment.regulatory_risk,
        financialImpact: gap.risk_assessment.financial_impact,
        operationalImpact: gap.risk_assessment.operational_impact,
      },
      recommendation: gap.recommendation,
      remediationSteps: gap.remediation_steps,
      citation: gap.citation,
      confidenceScore: gap.confidence_score,
    }));

    // Determine status based on score
    let status = "compliant";
    if (args.compliance_score < 50) status = "non_compliant";
    else if (args.compliance_score < 80) status = "partial";

    const id = await ctx.db.insert("complianceAnalysis", {
      auditId: args.audit_id,
      auditDate: args.audit_date,
      companyName: args.company_name,
      productName: args.product_name,
      regulationSource: args.regulation_source,
      complianceScore: args.compliance_score,
      status,
      gapsFound: transformedGaps,
      summary: {
        totalGaps: args.summary.total_gaps,
        criticalGaps: args.summary.critical_gaps,
        highGaps: args.summary.high_gaps,
        mediumGaps: args.summary.medium_gaps,
        lowGaps: args.summary.low_gaps,
      },
      recommendationsSummary: args.recommendations_summary,
      nextReviewDate: args.next_review_date,
      productSpecId: args.productSpecId,
      companyPoliciesId: args.companyPoliciesId,
      regulationId: args.regulationId,
      aiModel: "claude-haiku-4-5-20251001",
      analysisVersion: "2.0.0",
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("complianceAnalysis"),
    complianceScore: v.optional(v.number()),
    status: v.optional(v.string()),
    gapsFound: v.optional(v.array(gapValidator)),
    summary: v.optional(summaryValidator),
    recommendationsSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

export const addGap = mutation({
  args: {
    id: v.id("complianceAnalysis"),
    gap: gapValidator,
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.id);
    if (!analysis) throw new Error("Analysis not found");

    // Update gaps and recalculate summary
    const newGaps = [...analysis.gapsFound, args.gap];
    const newSummary = {
      totalGaps: newGaps.length,
      criticalGaps: newGaps.filter((g) => g.severity === "critical").length,
      highGaps: newGaps.filter((g) => g.severity === "high").length,
      mediumGaps: newGaps.filter((g) => g.severity === "medium").length,
      lowGaps: newGaps.filter((g) => g.severity === "low").length,
    };

    await ctx.db.patch(args.id, {
      gapsFound: newGaps,
      summary: newSummary,
    });
    return args.id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("complianceAnalysis"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("complianceAnalysis") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Recalculate score based on gaps
export const recalculateScore = mutation({
  args: { id: v.id("complianceAnalysis") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.id);
    if (!analysis) throw new Error("Analysis not found");

    // Scoring: deduct points based on gap severity
    const severityWeights: Record<string, number> = {
      critical: 25,
      high: 15,
      medium: 8,
      low: 3,
    };

    let deductions = 0;
    for (const gap of analysis.gapsFound) {
      const weight = severityWeights[gap.severity.toLowerCase()] || 5;
      deductions += weight;
    }

    const newScore = Math.max(0, 100 - deductions);

    let newStatus = "compliant";
    if (newScore < 50) newStatus = "non_compliant";
    else if (newScore < 80) newStatus = "partial";

    await ctx.db.patch(args.id, {
      complianceScore: newScore,
      status: newStatus,
    });

    return { score: newScore, status: newStatus };
  },
});
