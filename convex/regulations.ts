import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Queries
// ============================================

export const list = query({
  args: {
    jurisdiction: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.jurisdiction) {
      return await ctx.db
        .query("regulations")
        .withIndex("by_jurisdiction", (q) => q.eq("jurisdiction", args.jurisdiction!))
        .order("desc")
        .take(args.limit ?? 50);
    }

    return await ctx.db
      .query("regulations")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const getById = query({
  args: { id: v.id("regulations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByActName = query({
  args: { actName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("regulations")
      .withIndex("by_act_name", (q) => q.eq("act_name", args.actName))
      .first();
  },
});

export const search = query({
  args: {
    searchQuery: v.string(),
    jurisdiction: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let searchQ = ctx.db
      .query("regulations")
      .withSearchIndex("search_regulations", (q) => {
        let search = q.search("act_name", args.searchQuery);
        if (args.jurisdiction) {
          search = search.eq("jurisdiction", args.jurisdiction);
        }
        return search;
      });

    return await searchQ.take(20);
  },
});

export const getObligationsByRiskLevel = query({
  args: {
    regulationId: v.id("regulations"),
    riskLevel: v.string(),
  },
  handler: async (ctx, args) => {
    const regulation = await ctx.db.get(args.regulationId);
    if (!regulation) return [];

    return regulation.obligations.filter(
      (o) => o.risk_level.toLowerCase() === args.riskLevel.toLowerCase()
    );
  },
});

// ============================================
// Mutations
// ============================================

export const create = mutation({
  args: {
    act_name: v.string(),
    jurisdiction: v.string(),
    version: v.string(),
    last_updated: v.string(),
    definitions: v.array(
      v.object({
        term: v.string(),
        meaning: v.string(),
        source_section: v.string(),
      })
    ),
    obligations: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        applies_to: v.array(v.string()),
        source_section: v.string(),
        risk_level: v.string(),
      })
    ),
    procedures: v.array(
      v.object({
        name: v.string(),
        steps: v.array(v.string()),
        conditions: v.string(),
        source_section: v.string(),
      })
    ),
    offences: v.array(
      v.object({
        offence: v.string(),
        description: v.string(),
        source_section: v.string(),
      })
    ),
    penalties: v.array(
      v.object({
        offence: v.string(),
        fine_amount: v.string(),
        imprisonment_term: v.string(),
        corporate_penalty: v.string(),
        source_section: v.string(),
      })
    ),
    recordkeeping_requirements: v.object({
      retention_period: v.string(),
      conditions: v.string(),
      source_section: v.string(),
    }),
    applicability: v.array(
      v.object({
        entity_type: v.string(),
        obligations: v.array(v.string()),
        exemptions: v.array(v.string()),
      })
    ),
    exceptions: v.array(
      v.object({
        description: v.string(),
        source_section: v.string(),
      })
    ),
    cross_references: v.array(
      v.object({
        reference_type: v.string(),
        related_document: v.string(),
        description: v.string(),
      })
    ),
    source_url: v.optional(v.string()),
    scraped_at: v.optional(v.string()),
    pdf_filename: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const regulationId = await ctx.db.insert("regulations", args);
    return regulationId;
  },
});

export const update = mutation({
  args: {
    id: v.id("regulations"),
    act_name: v.optional(v.string()),
    version: v.optional(v.string()),
    last_updated: v.optional(v.string()),
    definitions: v.optional(
      v.array(
        v.object({
          term: v.string(),
          meaning: v.string(),
          source_section: v.string(),
        })
      )
    ),
    obligations: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          applies_to: v.array(v.string()),
          source_section: v.string(),
          risk_level: v.string(),
        })
      )
    ),
    // Add other optional fields as needed
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("regulations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Bulk insert from web scraping
export const bulkInsert = mutation({
  args: {
    regulations: v.array(
      v.object({
        act_name: v.string(),
        jurisdiction: v.string(),
        version: v.string(),
        last_updated: v.string(),
        definitions: v.array(
          v.object({
            term: v.string(),
            meaning: v.string(),
            source_section: v.string(),
          })
        ),
        obligations: v.array(
          v.object({
            name: v.string(),
            description: v.string(),
            applies_to: v.array(v.string()),
            source_section: v.string(),
            risk_level: v.string(),
          })
        ),
        procedures: v.array(
          v.object({
            name: v.string(),
            steps: v.array(v.string()),
            conditions: v.string(),
            source_section: v.string(),
          })
        ),
        offences: v.array(
          v.object({
            offence: v.string(),
            description: v.string(),
            source_section: v.string(),
          })
        ),
        penalties: v.array(
          v.object({
            offence: v.string(),
            fine_amount: v.string(),
            imprisonment_term: v.string(),
            corporate_penalty: v.string(),
            source_section: v.string(),
          })
        ),
        recordkeeping_requirements: v.object({
          retention_period: v.string(),
          conditions: v.string(),
          source_section: v.string(),
        }),
        applicability: v.array(
          v.object({
            entity_type: v.string(),
            obligations: v.array(v.string()),
            exemptions: v.array(v.string()),
          })
        ),
        exceptions: v.array(
          v.object({
            description: v.string(),
            source_section: v.string(),
          })
        ),
        cross_references: v.array(
          v.object({
            reference_type: v.string(),
            related_document: v.string(),
            description: v.string(),
          })
        ),
        source_url: v.optional(v.string()),
        scraped_at: v.optional(v.string()),
        pdf_filename: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const regulation of args.regulations) {
      const id = await ctx.db.insert("regulations", regulation);
      ids.push(id);
    }
    return ids;
  },
});

