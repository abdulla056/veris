import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================
// WebData Schema - Regulatory/Compliance Data
// ============================================

const definitionValidator = v.object({
  term: v.string(),
  meaning: v.string(),
  source_section: v.string(),
});

const obligationValidator = v.object({
  name: v.string(),
  description: v.string(),
  applies_to: v.array(v.string()),
  source_section: v.string(),
  risk_level: v.string(), // "Low" | "Medium" | "High" | ""
});

const procedureValidator = v.object({
  name: v.string(),
  steps: v.array(v.string()),
  conditions: v.string(),
  source_section: v.string(),
});

const offenceValidator = v.object({
  offence: v.string(),
  description: v.string(),
  source_section: v.string(),
});

const penaltyValidator = v.object({
  offence: v.string(),
  fine_amount: v.string(),
  imprisonment_term: v.string(),
  corporate_penalty: v.string(),
  source_section: v.string(),
});

const recordkeepingValidator = v.object({
  retention_period: v.string(),
  conditions: v.string(),
  source_section: v.string(),
});

const applicabilityValidator = v.object({
  entity_type: v.string(),
  obligations: v.array(v.string()),
  exemptions: v.array(v.string()),
});

const exceptionValidator = v.object({
  description: v.string(),
  source_section: v.string(),
});

const crossReferenceValidator = v.object({
  reference_type: v.string(),
  related_document: v.string(),
  description: v.string(),
});

// ============================================
// ProductSpec Schema - Company Product Data
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
// ProductPolicies Schema - Company Policies
// ============================================

const regulatoryCoverageValidator = v.object({
  regulatorReferences: v.array(v.string()),
  domains: v.array(v.string()), // KYC, AML, CTF, DataPrivacy, etc.
});

const policyApplicabilityValidator = v.object({
  appliesTo: v.array(v.string()),
  riskLevel: v.string(), // "Low" | "Medium" | "High"
});

const requirementValidator = v.object({
  requirementId: v.string(),
  text: v.string(),
  type: v.string(), // Process | Data | Operational | Technical | HR | Governance
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
// Schema Definition
// ============================================

export default defineSchema({
  // -------------------------------------------
  // WebData Table - Regulatory compliance data from web scraping
  // -------------------------------------------
  regulations: defineTable({
    act_name: v.string(),
    jurisdiction: v.string(),
    version: v.string(),
    last_updated: v.string(),
    definitions: v.array(definitionValidator),
    obligations: v.array(obligationValidator),
    procedures: v.array(procedureValidator),
    offences: v.array(offenceValidator),
    penalties: v.array(penaltyValidator),
    recordkeeping_requirements: recordkeepingValidator,
    applicability: v.array(applicabilityValidator),
    exceptions: v.array(exceptionValidator),
    cross_references: v.array(crossReferenceValidator),
    // Metadata
    source_url: v.optional(v.string()),
    scraped_at: v.optional(v.string()),
    pdf_filename: v.optional(v.string()),
  })
    .index("by_jurisdiction", ["jurisdiction"])
    .index("by_act_name", ["act_name"])
    .searchIndex("search_regulations", {
      searchField: "act_name",
      filterFields: ["jurisdiction"],
    }),

  // -------------------------------------------
  // ProductSpec Table - Company product specifications
  // -------------------------------------------
  productSpecs: defineTable({
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
    // Metadata
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
    status: v.optional(v.string()), // "draft" | "submitted" | "approved" | "rejected"
  })
    .index("by_company", ["companyName"])
    .index("by_product", ["productName"])
    .index("by_industry", ["industryCategory"])
    .index("by_status", ["status"])
    .searchIndex("search_products", {
      searchField: "productName",
      filterFields: ["companyName", "industryCategory"],
    }),

  // -------------------------------------------
  // ProductPolicies Table - Company policy specifications
  // -------------------------------------------
  companyPolicies: defineTable({
    companyName: v.string(),
    submissionId: v.string(),
    submittedAt: v.string(),
    policies: v.array(policyValidator),
    // Metadata
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
    status: v.optional(v.string()), // "draft" | "submitted" | "reviewed"
  })
    .index("by_company", ["companyName"])
    .index("by_submission", ["submissionId"])
    .index("by_status", ["status"]),

  // -------------------------------------------
  // Compliance Analysis Results - Generated comparisons
  // -------------------------------------------
  complianceAnalysis: defineTable({
    // Core identifiers
    auditId: v.string(),
    auditDate: v.string(), // ISO date string
    
    // Company/Product info (stored directly for standalone results)
    companyName: v.string(),
    productName: v.string(),
    regulationSource: v.string(),
    
    // Optional references to other tables (for linking)
    productSpecId: v.optional(v.id("productSpecs")),
    companyPoliciesId: v.optional(v.id("companyPolicies")),
    regulationId: v.optional(v.id("regulations")),
    
    // Compliance score
    complianceScore: v.number(), // 0-100
    status: v.string(), // "compliant" | "non_compliant" | "partial" | "pending_review"
    
    // Gap details (full structure from analyzer)
    gapsFound: v.array(
      v.object({
        gapId: v.string(),
        gapType: v.string(), // "missing_feature" | "missing_policy" | "incomplete_coverage" | "misaligned_requirement"
        severity: v.string(), // "critical" | "high" | "medium" | "low"
        regulation: v.object({
          name: v.string(),
          section: v.string(),
          requirement: v.string(),
          description: v.string(),
        }),
        currentState: v.string(),
        gapDescription: v.string(),
        affectedAreas: v.array(v.string()),
        riskAssessment: v.object({
          regulatoryRisk: v.string(),
          financialImpact: v.string(),
          operationalImpact: v.string(),
        }),
        recommendation: v.string(),
        remediationSteps: v.array(v.string()),
        citation: v.string(),
        confidenceScore: v.number(),
      })
    ),
    
    // Summary statistics
    summary: v.object({
      totalGaps: v.number(),
      criticalGaps: v.number(),
      highGaps: v.number(),
      mediumGaps: v.number(),
      lowGaps: v.number(),
    }),
    
    // Recommendations
    recommendationsSummary: v.string(),
    nextReviewDate: v.string(),
    
    // AI analysis metadata
    aiModel: v.optional(v.string()),
    analysisVersion: v.optional(v.string()),
  })
    .index("by_audit", ["auditId"])
    .index("by_company", ["companyName"])
    .index("by_product", ["productName"])
    .index("by_status", ["status"])
    .index("by_score", ["complianceScore"])
    .index("by_date", ["auditDate"]),

  // -------------------------------------------
  // Alerts & Notifications
  // -------------------------------------------
  alerts: defineTable({
    companyName: v.string(),
    productSpecId: v.optional(v.id("productSpecs")),
    regulationId: v.optional(v.id("regulations")),
    alertType: v.string(), // "new_regulation" | "compliance_gap" | "update_required" | "deadline"
    severity: v.string(), // "critical" | "high" | "medium" | "low" | "info"
    title: v.string(),
    message: v.string(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    dismissedAt: v.optional(v.number()),
    actionRequired: v.boolean(),
    actionUrl: v.optional(v.string()),
  })
    .index("by_company", ["companyName"])
    .index("by_type", ["alertType"])
    .index("by_severity", ["severity"])
    .index("by_unread", ["companyName", "readAt"]),

  // -------------------------------------------
  // Regulation Updates Tracking
  // -------------------------------------------
  regulationUpdates: defineTable({
    regulationId: v.id("regulations"),
    previousVersion: v.string(),
    newVersion: v.string(),
    changeType: v.string(), // "new" | "amendment" | "repeal" | "clarification"
    changeSummary: v.string(),
    effectiveDate: v.string(),
    detectedAt: v.number(),
    impactedAreas: v.array(v.string()),
  })
    .index("by_regulation", ["regulationId"])
    .index("by_date", ["detectedAt"]),
});

