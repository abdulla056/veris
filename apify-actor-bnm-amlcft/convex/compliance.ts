import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Insert or update compliance document
export const upsertComplianceDocument = mutation({
  args: {
    filename: v.string(),
    sourceUrl: v.string(),
    processedAt: v.string(),
    status: v.string(),
    actName: v.string(),
    jurisdiction: v.string(),
    version: v.string(),
    lastUpdated: v.string(),
    definitions: v.array(v.object({
      term: v.string(),
      meaning: v.string(),
      sourceSection: v.string(),
    })),
    obligations: v.array(v.object({
      name: v.string(),
      description: v.string(),
      appliesTo: v.array(v.string()),
      sourceSection: v.string(),
      riskLevel: v.string(),
    })),
    procedures: v.array(v.object({
      name: v.string(),
      steps: v.array(v.string()),
      conditions: v.string(),
      sourceSection: v.string(),
    })),
    offences: v.array(v.object({
      offence: v.string(),
      description: v.string(),
      sourceSection: v.string(),
    })),
    penalties: v.array(v.object({
      offence: v.string(),
      fineAmount: v.string(),
      imprisonmentTerm: v.string(),
      corporatePenalty: v.string(),
      sourceSection: v.string(),
    })),
    recordkeepingRequirements: v.object({
      retentionPeriod: v.string(),
      conditions: v.string(),
      sourceSection: v.string(),
    }),
    applicability: v.array(v.object({
      entityType: v.string(),
      obligations: v.array(v.string()),
      exemptions: v.array(v.string()),
    })),
    exceptions: v.array(v.object({
      description: v.string(),
      sourceSection: v.string(),
    })),
    crossReferences: v.array(v.object({
      referenceType: v.string(),
      relatedDocument: v.string(),
      description: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Check if document already exists
    const existing = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_filename", (q) => q.eq("filename", args.filename))
      .first();

    if (existing) {
      // Update existing document
      await ctx.db.patch(existing._id, args);
      return { action: "updated", id: existing._id };
    } else {
      // Insert new document
      const id = await ctx.db.insert("complianceDocuments", args);
      return { action: "inserted", id };
    }
  },
});

// Get all compliance documents
export const getAllComplianceDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("complianceDocuments").collect();
  },
});

// Get compliance document by filename
export const getByFilename = query({
  args: { filename: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complianceDocuments")
      .withIndex("by_filename", (q) => q.eq("filename", args.filename))
      .first();
  },
});

// Get all obligations across all documents
export const getAllObligations = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("complianceDocuments").collect();
    return docs.flatMap((doc) =>
      doc.obligations.map((obl) => ({
        ...obl,
        actName: doc.actName,
        filename: doc.filename,
      }))
    );
  },
});

// Get all penalties across all documents
export const getAllPenalties = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("complianceDocuments").collect();
    return docs.flatMap((doc) =>
      doc.penalties.map((pen) => ({
        ...pen,
        actName: doc.actName,
        filename: doc.filename,
      }))
    );
  },
});

