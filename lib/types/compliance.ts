// Type definitions for compliance gap analysis

// =========================================
// WebData Types (Regulatory Scrape Data)
// =========================================

export interface WebScrapeData {
  act_name: string;
  jurisdiction: string;
  version: string;
  last_updated: string;
  definitions: Definition[];
  obligations: Obligation[];
  procedures: Procedure[];
  offences: Offence[];
  penalties: Penalty[];
  recordkeeping_requirements: RecordkeepingRequirements;
  applicability: Applicability[];
  exceptions: Exception[];
  cross_references: CrossReference[];
}

export interface Definition {
  term: string;
  meaning: string;
  source_section: string;
}

export interface Obligation {
  name: string;
  description: string;
  applies_to: string[];
  source_section: string;
  risk_level: string;
}

export interface Procedure {
  name: string;
  steps: string[];
  conditions: string;
  source_section: string;
}

export interface Offence {
  offence: string;
  description: string;
  source_section: string;
}

export interface Penalty {
  offence: string;
  fine_amount: string;
  imprisonment_term: string;
  corporate_penalty: string;
  source_section: string;
}

export interface RecordkeepingRequirements {
  retention_period: string;
  conditions: string;
  source_section: string;
}

export interface Applicability {
  entity_type: string;
  obligations: string[];
  exemptions: string[];
}

export interface Exception {
  description: string;
  source_section: string;
}

export interface CrossReference {
  reference_type: string;
  related_document: string;
  description: string;
}

// =========================================
// ProductSpec Types (Company Product Spec)
// =========================================

export interface ProductSpecFile {
  companyProductSpec: ProductSpec;
}

export interface ProductSpec {
  companyName: string;
  registrationNumber: string;
  incorporationCountry: string;
  description: string;
  industryCategory: string;
  productName: string;
  productVersion: string;
  productDescription: string;
  submittedAt: string;
  features: ProductFeature[];
  financialOperations: FinancialOperation[];
  thirdPartyIntegrations: ThirdPartyIntegration[];
  systemArchitecture: SystemArchitecture;
  knownRisks: string[];
  keywords: string[];
}

export interface ProductFeature {
  featureId: string;
  name: string;
  description: string;
  dataUsed: string[];
  userTypes: string[];
  riskAreas: string[];
  relatedPolicies: string[];
}

export interface FinancialOperation {
  opId: string;
  name: string;
  type: string;
  description: string;
  dataUsed: string[];
  riskAreas: string[];
  relatedPolicies: string[];
}

export interface ThirdPartyIntegration {
  name: string;
  purpose: string;
  dataShared: string[];
  riskAreas: string[];
  relatedPolicies: string[];
}

export interface SystemArchitecture {
  frontend: string;
  backend: string;
  databases: string[];
  infrastructure: string[];
  securityControls: string[];
}

// =========================================
// ProductPolicy Types (Company Policy Spec)
// =========================================

export interface ProductPolicyFile {
  companyPolicySpec: CompanyPolicySpec;
}

export interface CompanyPolicySpec {
  companyName: string;
  submissionId: string;
  submittedAt: string;
  policies: ProductPolicy[];
}

export interface ProductPolicy {
  policyId: string;
  policyName: string;
  policyCategory: string;
  description: string;
  regulatoryCoverage: RegulatoryCoverage;
  applicability: PolicyApplicability;
  requirements: PolicyRequirement[];
  procedures: PolicyProcedure[];
  dataInvolved: string[];
  relatedProducts: string[];
  relatedRisks: string[];
  version: string;
  lastUpdated: string;
  sourcePage: string;
}

export interface RegulatoryCoverage {
  regulatorReferences: string[];
  domains: string[];
}

export interface PolicyApplicability {
  appliesTo: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | string;
}

export interface PolicyRequirement {
  requirementId: string;
  text: string;
  type: 'Process' | 'Data' | 'Operational' | 'Technical' | 'HR' | 'Governance' | string;
}

export interface PolicyProcedure {
  procedureId: string;
  stepNumber: number;
  text: string;
}

// =========================================
// Gap Analysis Types
// =========================================

export interface ComplianceGap {
  gap_id: string;
  gap_type: 'missing_feature' | 'missing_policy' | 'incomplete_coverage' | 'misaligned_requirement';
  severity: 'critical' | 'high' | 'medium' | 'low';
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
}

export interface GapAnalysisResult {
  audit_id: string;
  audit_date: string;
  company_name: string;
  product_name: string;
  regulation_source: string;
  gaps_found: ComplianceGap[];
  compliance_score: number;
  summary: {
    total_gaps: number;
    critical_gaps: number;
    high_gaps: number;
    medium_gaps: number;
    low_gaps: number;
  };
  recommendations_summary: string;
  next_review_date: string;
}
