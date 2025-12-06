import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Queries
// ============================================

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("regulationUpdates")
      .withIndex("by_date")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const getById = query({
  args: { id: v.id("regulationUpdates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByRegulation = query({
  args: { regulationId: v.id("regulations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("regulationUpdates")
      .withIndex("by_regulation", (q) => q.eq("regulationId", args.regulationId))
      .order("desc")
      .collect();
  },
});

export const getRecent = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = (args.days ?? 30) * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - daysAgo;

    const updates = await ctx.db
      .query("regulationUpdates")
      .withIndex("by_date")
      .order("desc")
      .collect();

    return updates.filter((u) => u.detectedAt >= cutoff);
  },
});

export const getByChangeType = query({
  args: { changeType: v.string() },
  handler: async (ctx, args) => {
    const updates = await ctx.db
      .query("regulationUpdates")
      .order("desc")
      .collect();

    return updates.filter((u) => u.changeType === args.changeType);
  },
});

// ============================================
// Mutations
// ============================================

export const create = mutation({
  args: {
    regulationId: v.id("regulations"),
    previousVersion: v.string(),
    newVersion: v.string(),
    changeType: v.string(),
    changeSummary: v.string(),
    effectiveDate: v.string(),
    impactedAreas: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("regulationUpdates", {
      ...args,
      detectedAt: Date.now(),
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("regulationUpdates"),
    changeSummary: v.optional(v.string()),
    effectiveDate: v.optional(v.string()),
    impactedAreas: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("regulationUpdates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Track a new regulation update and create alerts
export const trackAndAlert = mutation({
  args: {
    regulationId: v.id("regulations"),
    previousVersion: v.string(),
    newVersion: v.string(),
    changeType: v.string(),
    changeSummary: v.string(),
    effectiveDate: v.string(),
    impactedAreas: v.array(v.string()),
    affectedCompanies: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { affectedCompanies, ...updateData } = args;

    // Create the update record
    const updateId = await ctx.db.insert("regulationUpdates", {
      ...updateData,
      detectedAt: Date.now(),
    });

    // Get the regulation details
    const regulation = await ctx.db.get(args.regulationId);
    const actName = regulation?.act_name ?? "Unknown Regulation";

    // Create alerts for affected companies
    const now = Date.now();
    for (const companyName of affectedCompanies) {
      await ctx.db.insert("alerts", {
        companyName,
        regulationId: args.regulationId,
        alertType: args.changeType === "new" ? "new_regulation" : "update_required",
        severity: args.changeType === "new" || args.changeType === "amendment" ? "high" : "medium",
        title: `Regulation Update: ${actName}`,
        message: args.changeSummary,
        createdAt: now,
        actionRequired: true,
        actionUrl: `/regulations/${args.regulationId}`,
      });
    }

    return updateId;
  },
});

