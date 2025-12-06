import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Queries
// ============================================

export const list = query({
  args: {
    companyName: v.optional(v.string()),
    alertType: v.optional(v.string()),
    severity: v.optional(v.string()),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    let alerts;
    if (args.companyName) {
      alerts = await ctx.db
        .query("alerts")
        .withIndex("by_company", (q) => q.eq("companyName", args.companyName!))
        .order("desc")
        .take(limit);
    } else if (args.alertType) {
      alerts = await ctx.db
        .query("alerts")
        .withIndex("by_type", (q) => q.eq("alertType", args.alertType!))
        .order("desc")
        .take(limit);
    } else if (args.severity) {
      alerts = await ctx.db
        .query("alerts")
        .withIndex("by_severity", (q) => q.eq("severity", args.severity!))
        .order("desc")
        .take(limit);
    } else {
      alerts = await ctx.db.query("alerts").order("desc").take(limit);
    }

    if (args.unreadOnly) {
      alerts = alerts.filter((a) => !a.readAt);
    }

    return alerts;
  },
});

export const getById = query({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUnreadForCompany = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .order("desc")
      .collect();

    return alerts.filter((a) => !a.readAt && !a.dismissedAt);
  },
});

export const getUnreadCount = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .collect();

    return alerts.filter((a) => !a.readAt && !a.dismissedAt).length;
  },
});

export const getCriticalAlerts = query({
  args: { companyName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("alerts").withIndex("by_severity", (q) => q.eq("severity", "critical"));

    let alerts = await q.order("desc").take(50);

    if (args.companyName) {
      alerts = alerts.filter((a) => a.companyName === args.companyName);
    }

    return alerts.filter((a) => !a.dismissedAt);
  },
});

export const getActionRequired = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .collect();

    return alerts.filter((a) => a.actionRequired && !a.dismissedAt);
  },
});

// ============================================
// Mutations
// ============================================

export const create = mutation({
  args: {
    companyName: v.string(),
    productSpecId: v.optional(v.id("productSpecs")),
    regulationId: v.optional(v.id("regulations")),
    alertType: v.string(),
    severity: v.string(),
    title: v.string(),
    message: v.string(),
    actionRequired: v.boolean(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("alerts", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      readAt: Date.now(),
    });
    return args.id;
  },
});

export const markAllAsRead = mutation({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_company", (q) => q.eq("companyName", args.companyName))
      .collect();

    const unread = alerts.filter((a) => !a.readAt);
    const now = Date.now();

    for (const alert of unread) {
      await ctx.db.patch(alert._id, { readAt: now });
    }

    return unread.length;
  },
});

export const dismiss = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      dismissedAt: Date.now(),
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Create alert for new regulation
export const createRegulationAlert = mutation({
  args: {
    companyName: v.string(),
    regulationId: v.id("regulations"),
    actName: v.string(),
    changeType: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("alerts", {
      companyName: args.companyName,
      regulationId: args.regulationId,
      alertType: "new_regulation",
      severity: args.changeType === "new" ? "high" : "medium",
      title: `New Regulation: ${args.actName}`,
      message: `A ${args.changeType} regulation "${args.actName}" has been detected. Please review for compliance impact.`,
      createdAt: Date.now(),
      actionRequired: true,
      actionUrl: `/regulations/${args.regulationId}`,
    });
    return id;
  },
});

// Create alert for compliance gap
export const createComplianceGapAlert = mutation({
  args: {
    companyName: v.string(),
    productSpecId: v.id("productSpecs"),
    gapCount: v.number(),
    criticalCount: v.number(),
    analysisId: v.id("complianceAnalysis"),
  },
  handler: async (ctx, args) => {
    const severity = args.criticalCount > 0 ? "critical" : args.gapCount > 5 ? "high" : "medium";

    const id = await ctx.db.insert("alerts", {
      companyName: args.companyName,
      productSpecId: args.productSpecId,
      alertType: "compliance_gap",
      severity,
      title: `Compliance Gaps Detected`,
      message: `${args.gapCount} compliance gap(s) found, including ${args.criticalCount} critical issue(s). Immediate review recommended.`,
      createdAt: Date.now(),
      actionRequired: args.criticalCount > 0,
      actionUrl: `/analysis/${args.analysisId}`,
    });
    return id;
  },
});

// Bulk create alerts for multiple companies
export const bulkCreateRegulationAlerts = mutation({
  args: {
    companyNames: v.array(v.string()),
    regulationId: v.id("regulations"),
    actName: v.string(),
  },
  handler: async (ctx, args) => {
    const ids = [];
    const now = Date.now();

    for (const companyName of args.companyNames) {
      const id = await ctx.db.insert("alerts", {
        companyName,
        regulationId: args.regulationId,
        alertType: "new_regulation",
        severity: "high",
        title: `New Regulation: ${args.actName}`,
        message: `A new regulation "${args.actName}" has been published. Please review for compliance impact.`,
        createdAt: now,
        actionRequired: true,
        actionUrl: `/regulations/${args.regulationId}`,
      });
      ids.push(id);
    }

    return ids;
  },
});

