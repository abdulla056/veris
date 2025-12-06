import Anthropic from '@anthropic-ai/sdk';
import type {
  WebScrapeData,
  ProductSpec,
  ProductPolicy,
  ComplianceGap,
  GapAnalysisResult,
  Obligation,
} from '@/lib/types/compliance';

/**
 * Compliance Gap Analyzer Service
 * Uses Claude AI for semantic analysis of regulatory compliance gaps
 */
export class ComplianceGapAnalyzer {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Main method to analyze compliance gaps between regulations and product/policy
   */
  async analyzeGaps(
    regulations: WebScrapeData,
    productSpec: ProductSpec,
    productPolicy: ProductPolicy
  ): Promise<GapAnalysisResult> {
    const auditId = `AUD-${Date.now()}`;
    const auditDate = new Date().toISOString();

    console.log('🔍 Starting compliance gap analysis...');
    console.log(`📋 Analyzing ${regulations.obligations.length} regulatory obligations`);

    const gaps: ComplianceGap[] = [];

    // Analyze each obligation
    for (const obligation of regulations.obligations) {
      console.log(`\n🔎 Analyzing: ${obligation.name}`);
      
      const gap = await this.analyzeObligation(
        obligation,
        regulations,
        productSpec,
        productPolicy
      );

      if (gap) {
        gaps.push(gap);
        console.log(`⚠️  Gap detected: ${gap.severity.toUpperCase()}`);
      } else {
        console.log(`✅ Compliant`);
      }
    }

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(
      regulations.obligations.length,
      gaps
    );

    // Generate summary
    const summary = {
      total_gaps: gaps.length,
      critical_gaps: gaps.filter(g => g.severity === 'critical').length,
      high_gaps: gaps.filter(g => g.severity === 'high').length,
      medium_gaps: gaps.filter(g => g.severity === 'medium').length,
      low_gaps: gaps.filter(g => g.severity === 'low').length,
    };

    const recommendationsSummary = await this.generateRecommendationsSummary(gaps);

    return {
      audit_id: auditId,
      audit_date: auditDate,
      product_name: productSpec.product_name,
      regulation_source: regulations.act_name,
      gaps_found: gaps,
      compliance_score: complianceScore,
      summary,
      recommendations_summary: recommendationsSummary,
      next_review_date: this.calculateNextReviewDate(),
    };
  }

  /**
   * Analyze a single obligation for compliance gaps using Claude
   */
  private async analyzeObligation(
    obligation: Obligation,
    regulations: WebScrapeData,
    productSpec: ProductSpec,
    productPolicy: ProductPolicy
  ): Promise<ComplianceGap | null> {
    const prompt = this.buildAnalysisPrompt(
      obligation,
      regulations,
      productSpec,
      productPolicy
    );

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent analysis
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Strip markdown code fences and extract JSON
      let jsonText = content.text.trim();
      
      // Remove markdown code fences if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\s*\n/, '');
        jsonText = jsonText.replace(/\n```[\s\S]*$/, ''); // Remove closing fence and any text after
      }
      
      // Try to extract just the JSON object if there's extra text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const analysis = JSON.parse(jsonText);

      // If Claude determines there's a gap, create a ComplianceGap object
      if (analysis.has_gap) {
        const gapId = `GAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          gap_id: gapId,
          gap_type: analysis.gap_type,
          severity: analysis.severity,
          regulation: {
            name: obligation.name,
            section: obligation.source_section,
            requirement: obligation.description,
            description: obligation.description,
          },
          current_state: analysis.current_state,
          gap_description: analysis.gap_description,
          affected_areas: analysis.affected_areas,
          risk_assessment: analysis.risk_assessment,
          recommendation: analysis.recommendation,
          remediation_steps: analysis.remediation_steps,
          citation: `${regulations.act_name}, ${obligation.source_section}`,
          confidence_score: analysis.confidence_score,
        };
      }

      return null;
    } catch (error) {
      console.error(`Error analyzing obligation "${obligation.name}":`, error);
      throw error;
    }
  }

  /**
   * Build the analysis prompt for Claude
   */
  private buildAnalysisPrompt(
    obligation: Obligation,
    regulations: WebScrapeData,
    productSpec: ProductSpec,
    productPolicy: ProductPolicy
  ): string {
    return `You are an expert regulatory compliance auditor specializing in Malaysian banking and AML/CFT regulations.

Your task is to perform a detailed semantic analysis to determine if the product specification and internal policy adequately address a specific regulatory obligation.

# REGULATORY OBLIGATION TO ANALYZE:

**Obligation Name:** ${obligation.name}
**Description:** ${obligation.description}
**Applies To:** ${obligation.applies_to.join(', ')}
**Source Section:** ${obligation.source_section}
**Risk Level:** ${obligation.risk_level}
**Regulation:** ${regulations.act_name}

# PRODUCT SPECIFICATION:

**Product:** ${productSpec.product_name}
**Description:** ${productSpec.description}

**Key Features:**
${productSpec.key_features.map(f => `- ${f.name}: ${f.description}\n  Regulatory Relevance: ${f.regulatory_relevance.join(', ')}`).join('\n')}

**Data Pipeline:**
- Inputs: ${productSpec.data_pipeline.inputs.join(', ')}
- Processing: ${productSpec.data_pipeline.processing.join(', ')}
- Outputs: ${productSpec.data_pipeline.outputs.join(', ')}

**Risk Management:**
- Risks: ${productSpec.risk_management.llm_risks.join(', ')}
- Mitigations: ${productSpec.risk_management.mitigations.join(', ')}

# CURRENT INTERNAL POLICY:

**Policy:** ${productPolicy.policy_name}
**Description:** ${productPolicy.description}

**Requirements:**
${productPolicy.requirements.map(r => `- [${r.category}] ${r.text} (Risk: ${r.risk_level})`).join('\n')}

**Internal Controls:**
${productPolicy.internal_controls.map(c => `- ${c.name}: ${c.description} (Frequency: ${c.frequency})`).join('\n')}

**Procedures:**
${productPolicy.procedures.map(p => `- ${p.name}: ${p.steps.join(' → ')}`).join('\n')}

**Record Keeping:**
- Duration: ${productPolicy.record_keeping.duration_years} years
- Records: ${productPolicy.record_keeping.records_required.join(', ')}

# ANALYSIS INSTRUCTIONS:

Perform a thorough semantic analysis to determine:

1. **Coverage Analysis:** Does the product specification and/or internal policy adequately address this regulatory obligation?
2. **Gap Detection:** Are there any missing elements, incomplete implementations, or misaligned requirements?
3. **Risk Assessment:** What are the regulatory, financial, and operational risks if this gap exists?

# OUTPUT FORMAT:

Respond ONLY with valid JSON in this exact format:

{
  "has_gap": boolean,
  "gap_type": "missing_feature" | "missing_policy" | "incomplete_coverage" | "misaligned_requirement" | null,
  "severity": "critical" | "high" | "medium" | "low" | null,
  "current_state": "string describing what currently exists",
  "gap_description": "string describing the specific gap found" | null,
  "affected_areas": ["area1", "area2"],
  "risk_assessment": {
    "regulatory_risk": "description of regulatory risk",
    "financial_impact": "description of potential fines/costs",
    "operational_impact": "description of operational consequences"
  },
  "recommendation": "string with high-level recommendation" | null,
  "remediation_steps": ["step1", "step2", "step3"] | [],
  "confidence_score": 0.0 to 1.0
}

# ANALYSIS CRITERIA:

- If the product/policy **fully addresses** the obligation with appropriate controls: has_gap = false
- If there's **no mention** of this obligation: has_gap = true, severity = "critical" or "high"
- If there's **partial coverage** but missing key elements: has_gap = true, severity = "medium"
- If coverage is adequate but could be improved: has_gap = true, severity = "low"

Be precise and cite specific elements from the product spec or policy in your analysis.`;
  }

  /**
   * Calculate overall compliance score
   */
  private calculateComplianceScore(
    totalObligations: number,
    gaps: ComplianceGap[]
  ): number {
    if (totalObligations === 0) return 100;

    // Weighted scoring based on severity
    const weights = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    let totalDeductions = 0;
    gaps.forEach(gap => {
      totalDeductions += weights[gap.severity];
    });

    const maxPossibleDeductions = totalObligations * weights.critical;
    const score = Math.max(0, 100 - (totalDeductions / maxPossibleDeductions) * 100);

    return Math.round(score);
  }

  /**
   * Generate a summary of recommendations using Claude
   */
  private async generateRecommendationsSummary(
    gaps: ComplianceGap[]
  ): Promise<string> {
    if (gaps.length === 0) {
      return 'No compliance gaps detected. The product and policies are fully aligned with regulatory requirements.';
    }

    const prompt = `You are a compliance expert. Summarize the following compliance gaps into a concise executive summary (2-3 sentences) highlighting the most critical issues and overall recommendations.

Gaps found:
${gaps.map(g => `- [${g.severity.toUpperCase()}] ${g.gap_description}`).join('\n')}

Provide a brief, actionable summary for executives.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
      
      return 'Unable to generate recommendations summary.';
    } catch (error) {
      console.error('Error generating recommendations summary:', error);
      return 'Multiple compliance gaps detected. Please review detailed findings.';
    }
  }

  /**
   * Calculate next review date (default: 12 months)
   */
  private calculateNextReviewDate(): string {
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + 12);
    return nextReview.toISOString();
  }

  /**
   * Export analysis results to JSON
   */
  exportToJSON(result: GapAnalysisResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Generate a human-readable report
   */
  generateReport(result: GapAnalysisResult): string {
    let report = `
╔══════════════════════════════════════════════════════════════════════╗
║                   COMPLIANCE GAP ANALYSIS REPORT                     ║
╚══════════════════════════════════════════════════════════════════════╝

Audit ID: ${result.audit_id}
Date: ${new Date(result.audit_date).toLocaleString()}
Product: ${result.product_name}
Regulation: ${result.regulation_source}

═══════════════════════════════════════════════════════════════════════

COMPLIANCE SCORE: ${result.compliance_score}/100

SUMMARY:
--------
Total Gaps Found: ${result.summary.total_gaps}
  • Critical: ${result.summary.critical_gaps}
  • High: ${result.summary.high_gaps}
  • Medium: ${result.summary.medium_gaps}
  • Low: ${result.summary.low_gaps}

EXECUTIVE SUMMARY:
------------------
${result.recommendations_summary}

═══════════════════════════════════════════════════════════════════════

DETAILED FINDINGS:
------------------
`;

    result.gaps_found.forEach((gap, index) => {
      const severityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      }[gap.severity];

      report += `
${index + 1}. ${severityEmoji} [${gap.severity.toUpperCase()}] ${gap.regulation.name}
   ${'-'.repeat(70)}
   
   Gap Description:
   ${gap.gap_description}
   
   Current State:
   ${gap.current_state}
   
   Regulatory Citation:
   ${gap.citation}
   
   Risk Assessment:
   • Regulatory Risk: ${gap.risk_assessment.regulatory_risk}
   • Financial Impact: ${gap.risk_assessment.financial_impact}
   • Operational Impact: ${gap.risk_assessment.operational_impact}
   
   Recommendation:
   ${gap.recommendation}
   
   Remediation Steps:
   ${gap.remediation_steps.map((step, i) => `   ${i + 1}. ${step}`).join('\n')}
   
   Confidence Score: ${(gap.confidence_score * 100).toFixed(1)}%
   
`;
    });

    report += `
═══════════════════════════════════════════════════════════════════════

Next Review Date: ${new Date(result.next_review_date).toLocaleDateString()}

═══════════════════════════════════════════════════════════════════════
Report Generated: ${new Date().toLocaleString()}
`;

    return report;
  }
}

