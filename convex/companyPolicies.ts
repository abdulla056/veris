import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Validators
// ============================================

const regulatoryCoverageValidator = v.object({
  regulatorReferences: v.array(v.string()),
  domains: v.array(v.string()),
});

const policyApplicabilityValidator = v.object({
  appliesTo: v.array(v.string()),
  riskLevel: v.string(),
});

const requirementValidator = v.object({
  requirementId: v.string(),
  text: v.string(),
  type: v.string(),
});

const policyProcedureValidator = v.object({
  procedureId: v.string(),
  stepNumber: v.number(),
  text: v.string(),
});

const policyValidator = v.object({
  policyId: v.string(),
  policyName: v.string(),
  policyCategory: v.string(),
  description: v.string(),
  regulatoryCoverage: regulatoryCoverageValidator,
  applicability: policyApplicabilityValidator,
  requirements: v.array(requirementValidator),
  procedures: v.array(policyProcedureValidator),
  dataInvolved: v.array(v.string()),
  relatedProducts: v.array(v.string()),
  relatedRisks: v.array(v.string()),
  version: v.string(),
  lastUpdated: v.string(),
  sourcePage: v.string(),
});

// ============================================
// Queries
// ============================================

export const list = query({
  args: {
    companyName: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.companyName) {
      return await ctx.db
        .query("companyPolicies")
        .withIndex("by_company", (q) => q.eq("companyName", args.companyName!))
        .order("desc")
        .take(limit);
    } else if (args.status) {
      return await ctx.db
        .query("companyPolicies")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    }

    return await ctx.db.query("companyPolicies").order("desc").take(limit);
  },
});

export const getById = query({
  args: { id: v.id("companyPolicies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByCompany = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companyPolicies")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .collect();
  },
});

export const getBySubmissionId = query({
  args: { submissionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companyPolicies")
      .withIndex("by_submission", (q) => q.eq("submissionId", args.submissionId))
      .first();
  },
});

export const getPoliciesByDomain = query({
  args: {
    id: v.id("companyPolicies"),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return [];

    return doc.policies.filter((p) =>
      p.regulatoryCoverage.domains.includes(args.domain)
    );
  },
});

export const getPoliciesByRiskLevel = query({
  args: {
    id: v.id("companyPolicies"),
    riskLevel: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return [];

    return doc.policies.filter(
      (p) => p.applicability.riskLevel.toLowerCase() === args.riskLevel.toLowerCase()
    );
  },
});

export const getAllDomainsCovered = query({
  args: { id: v.id("companyPolicies") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return [];

    const allDomains = doc.policies.flatMap((p) => p.regulatoryCoverage.domains);
    return [...new Set(allDomains)];
  },
});

// ============================================
// Mutations
// ============================================

export const create = mutation({
  args: {
    companyName: v.string(),
    submissionId: v.string(),
    submittedAt: v.string(),
    policies: v.array(policyValidator),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("companyPolicies", {
      ...args,
      createdAt: now,
      updatedAt: now,
      status: args.status ?? "draft",
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("companyPolicies"),
    policies: v.optional(v.array(policyValidator)),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const addPolicy = mutation({
  args: {
    id: v.id("companyPolicies"),
    policy: policyValidator,
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Company policies document not found");

    await ctx.db.patch(args.id, {
      policies: [...doc.policies, args.policy],
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const updatePolicy = mutation({
  args: {
    id: v.id("companyPolicies"),
    policyId: v.string(),
    updates: v.object({
      policyName: v.optional(v.string()),
      policyCategory: v.optional(v.string()),
      description: v.optional(v.string()),
      regulatoryCoverage: v.optional(regulatoryCoverageValidator),
      applicability: v.optional(policyApplicabilityValidator),
      requirements: v.optional(v.array(requirementValidator)),
      procedures: v.optional(v.array(policyProcedureValidator)),
      dataInvolved: v.optional(v.array(v.string())),
      relatedProducts: v.optional(v.array(v.string())),
      relatedRisks: v.optional(v.array(v.string())),
      version: v.optional(v.string()),
      lastUpdated: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Company policies document not found");

    const updatedPolicies = doc.policies.map((p) => {
      if (p.policyId === args.policyId) {
        return { ...p, ...args.updates };
      }
      return p;
    });

    await ctx.db.patch(args.id, {
      policies: updatedPolicies,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const removePolicy = mutation({
  args: {
    id: v.id("companyPolicies"),
    policyId: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Company policies document not found");

    await ctx.db.patch(args.id, {
      policies: doc.policies.filter((p) => p.policyId !== args.policyId),
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("companyPolicies") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("companyPolicies"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

