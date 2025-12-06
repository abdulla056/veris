import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  complianceDocuments: defineTable({
    // Document metadata
    filename: v.string(),
    sourceUrl: v.string(),
    processedAt: v.string(),
    status: v.string(),
    
    // Core compliance data
    actName: v.string(),
    jurisdiction: v.string(),
    version: v.string(),
    lastUpdated: v.string(),
    
    // Definitions
    definitions: v.array(v.object({
      term: v.string(),
      meaning: v.string(),
      sourceSection: v.string(),
    })),
    
    // Obligations
    obligations: v.array(v.object({
      name: v.string(),
      description: v.string(),
      appliesTo: v.array(v.string()),
      sourceSection: v.string(),
      riskLevel: v.string(),
    })),
    
    // Procedures
    procedures: v.array(v.object({
      name: v.string(),
      steps: v.array(v.string()),
      conditions: v.string(),
      sourceSection: v.string(),
    })),
    
    // Offences
    offences: v.array(v.object({
      offence: v.string(),
      description: v.string(),
      sourceSection: v.string(),
    })),
    
    // Penalties
    penalties: v.array(v.object({
      offence: v.string(),
      fineAmount: v.string(),
      imprisonmentTerm: v.string(),
      corporatePenalty: v.string(),
      sourceSection: v.string(),
    })),
    
    // Recordkeeping
    recordkeepingRequirements: v.object({
      retentionPeriod: v.string(),
      conditions: v.string(),
      sourceSection: v.string(),
    }),
    
    // Applicability
    applicability: v.array(v.object({
      entityType: v.string(),
      obligations: v.array(v.string()),
      exemptions: v.array(v.string()),
    })),
    
    // Exceptions
    exceptions: v.array(v.object({
      description: v.string(),
      sourceSection: v.string(),
    })),
    
    // Cross references
    crossReferences: v.array(v.object({
      referenceType: v.string(),
      relatedDocument: v.string(),
      description: v.string(),
    })),
  }).index("by_filename", ["filename"])
    .index("by_act", ["actName"]),
});

