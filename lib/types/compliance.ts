// Type definitions for compliance gap analysis

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

// Product Spec Types
export interface ProductSpec {
  product_name: string;
  version: string;
  description: string;
  target_industry: string[];
  key_features: KeyFeature[];
  architecture: Architecture;
  data_pipeline: DataPipeline;
  risk_management: RiskManagement;
  regulatory_scope: RegulatoryScope[];
}

export interface KeyFeature {
  id: string;
  name: string;
  description: string;
  problem_solved: string;
  regulatory_relevance: string[];
  dependencies: string[];
  status: string;
}

export interface Architecture {
  frontend: {
    type: string;
    tech_stack: string[];
  };
  backend: {
    services: string[];
    databases: string[];
    ai_models: string[];
    infra: string[];
  };
}

export interface DataPipeline {
  inputs: string[];
  processing: string[];
  outputs: string[];
}

export interface RiskManagement {
  llm_risks: string[];
  mitigations: string[];
}

export interface RegulatoryScope {
  jurisdiction: string;
  documents: {
    name: string;
    sections_used: string[];
    last_updated: string;
    url: string;
  }[];
}

// Product Policy Types
export interface ProductPolicy {
  policy_id: string;
  policy_name: string;
  policy_type: string;
  jurisdiction: string;
  source_document: {
    title: string;
    url: string;
    section: string;
    excerpt: string;
  };
  description: string;
  requirements: Requirement[];
  obligations: PolicyObligation[];
  internal_controls: InternalControl[];
  procedures: PolicyProcedure[];
  record_keeping: RecordKeeping;
  exceptions: PolicyException[];
  risk_indicators: RiskIndicator[];
  last_updated: string;
  effective_date: string;
  review_frequency: string;
}

export interface Requirement {
  requirement_id: string;
  text: string;
  risk_level: string;
  category: string;
}

export interface PolicyObligation {
  obligation_id: string;
  summary: string;
  detailed_text: string;
  violations_if_unmet: string[];
  penalties: {
    fine: string;
    imprisonment: string;
    regulator: string;
  };
}

export interface InternalControl {
  control_id: string;
  name: string;
  description: string;
  related_requirements: string[];
  frequency: string;
  responsible_role: string;
}

export interface PolicyProcedure {
  procedure_id: string;
  name: string;
  steps: string[];
  inputs: string[];
  outputs: string[];
}

export interface RecordKeeping {
  duration_years: string;
  records_required: string[];
  storage_requirements: string;
}

export interface PolicyException {
  exception_id: string;
  allowed_under: string;
  conditions: string;
}

export interface RiskIndicator {
  indicator_id: string;
  name: string;
  description: string;
  threshold: string;
}

// Gap Analysis Types
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

