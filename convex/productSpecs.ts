import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Validators (reusable)
// ============================================

const featureValidator = v.object({
  featureId: v.string(),
  name: v.string(),
  description: v.string(),
  dataUsed: v.array(v.string()),
  userTypes: v.array(v.string()),
  riskAreas: v.array(v.string()),
  relatedPolicies: v.array(v.string()),
});

const financialOperationValidator = v.object({
  opId: v.string(),
  name: v.string(),
  type: v.string(),
  description: v.string(),
  dataUsed: v.array(v.string()),
  riskAreas: v.array(v.string()),
  relatedPolicies: v.array(v.string()),
});

const thirdPartyIntegrationValidator = v.object({
  name: v.string(),
  purpose: v.string(),
  dataShared: v.array(v.string()),
  riskAreas: v.array(v.string()),
  relatedPolicies: v.array(v.string()),
});

const systemArchitectureValidator = v.object({
  frontend: v.string(),
  backend: v.string(),
  databases: v.array(v.string()),
  infrastructure: v.array(v.string()),
  securityControls: v.array(v.string()),
});

// ============================================
// Queries
// ============================================

export const list = query({
  args: {
    companyName: v.optional(v.string()),
    industryCategory: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.companyName) {
      return await ctx.db
        .query("productSpecs")
        .withIndex("by_company", (q) => q.eq("companyName", args.companyName!))
        .order("desc")
        .take(limit);
    } else if (args.industryCategory) {
      return await ctx.db
        .query("productSpecs")
        .withIndex("by_industry", (q) => q.eq("industryCategory", args.industryCategory!))
        .order("desc")
        .take(limit);
    } else if (args.status) {
      return await ctx.db
        .query("productSpecs")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    }

    return await ctx.db.query("productSpecs").order("desc").take(limit);
  },
});

export const getById = query({
  args: { id: v.id("productSpecs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByCompany = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productSpecs")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .collect();
  },
});

export const search = query({
  args: {
    searchQuery: v.string(),
    companyName: v.optional(v.string()),
    industryCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let searchQ = ctx.db
      .query("productSpecs")
      .withSearchIndex("search_products", (q) => {
        let search = q.search("productName", args.searchQuery);
        if (args.companyName) {
          search = search.eq("companyName", args.companyName);
        }
        if (args.industryCategory) {
          search = search.eq("industryCategory", args.industryCategory);
        }
        return search;
      });

    return await searchQ.take(20);
  },
});

export const getRiskAreas = query({
  args: { id: v.id("productSpecs") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return { features: [], financialOps: [], integrations: [], known: [] };

    const featureRisks = product.features.flatMap((f) => f.riskAreas);
    const finOpRisks = product.financialOperations.flatMap((f) => f.riskAreas);
    const integrationRisks = product.thirdPartyIntegrations.flatMap((t) => t.riskAreas);

    return {
      features: [...new Set(featureRisks)],
      financialOps: [...new Set(finOpRisks)],
      integrations: [...new Set(integrationRisks)],
      known: product.knownRisks,
      all: [...new Set([...featureRisks, ...finOpRisks, ...integrationRisks, ...product.knownRisks])],
    };
  },
});

// ============================================
// Mutations
// ============================================

export const create = mutation({
  args: {
    companyName: v.string(),
    registrationNumber: v.string(),
    incorporationCountry: v.string(),
    description: v.string(),
    industryCategory: v.string(),
    productName: v.string(),
    productVersion: v.string(),
    productDescription: v.string(),
    submittedAt: v.string(),
    features: v.array(featureValidator),
    financialOperations: v.array(financialOperationValidator),
    thirdPartyIntegrations: v.array(thirdPartyIntegrationValidator),
    systemArchitecture: systemArchitectureValidator,
    knownRisks: v.array(v.string()),
    keywords: v.array(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const productSpecId = await ctx.db.insert("productSpecs", {
      ...args,
      createdAt: now,
      updatedAt: now,
      status: args.status ?? "draft",
    });
    return productSpecId;
  },
});

export const update = mutation({
  args: {
    id: v.id("productSpecs"),
    productName: v.optional(v.string()),
    productVersion: v.optional(v.string()),
    productDescription: v.optional(v.string()),
    features: v.optional(v.array(featureValidator)),
    financialOperations: v.optional(v.array(financialOperationValidator)),
    thirdPartyIntegrations: v.optional(v.array(thirdPartyIntegrationValidator)),
    systemArchitecture: v.optional(systemArchitectureValidator),
    knownRisks: v.optional(v.array(v.string())),
    keywords: v.optional(v.array(v.string())),
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

export const updateStatus = mutation({
  args: {
    id: v.id("productSpecs"),
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

export const remove = mutation({
  args: { id: v.id("productSpecs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Add a feature to existing product
export const addFeature = mutation({
  args: {
    id: v.id("productSpecs"),
    feature: featureValidator,
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    await ctx.db.patch(args.id, {
      features: [...product.features, args.feature],
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Add financial operation
export const addFinancialOperation = mutation({
  args: {
    id: v.id("productSpecs"),
    operation: financialOperationValidator,
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    await ctx.db.patch(args.id, {
      financialOperations: [...product.financialOperations, args.operation],
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

