# Semantic Compliance Gap Analysis - System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│                    (Dashboard / Upload Page)                        │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          │ Upload 3 Documents
                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      DOCUMENT PROCESSING                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐            │
│  │ Regulations │  │ Product Spec │  │ Product Policy │            │
│  │   (PDF)     │  │    (PDF)     │  │     (PDF)      │            │
│  └──────┬──────┘  └──────┬───────┘  └────────┬───────┘            │
│         │                 │                    │                     │
│         └─────────────────┼────────────────────┘                     │
│                           │ Parse & Extract                          │
│                           ↓                                          │
│         ┌────────────────────────────────┐                          │
│         │  Convert to Structured JSON    │                          │
│         └────────────┬───────────────────┘                          │
└──────────────────────┼──────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  COMPLIANCE GAP ANALYZER                            │
│                   (lib/compliance-gap-analyzer.ts)                  │
│                                                                     │
│  ┌────────────────────────────────────────────────────┐            │
│  │  Main Method: analyzeGaps()                        │            │
│  │                                                    │            │
│  │  For each regulatory obligation:                  │            │
│  │    1. Build analysis prompt                       │            │
│  │    2. Send to Claude API                          │            │
│  │    3. Parse response                              │            │
│  │    4. Create ComplianceGap object                 │            │
│  │    5. Calculate confidence score                  │            │
│  └────────────────────────────────────────────────────┘            │
│                           ↓                                          │
│  ┌────────────────────────────────────────────────────┐            │
│  │         CLAUDE AI (Semantic Analysis)              │            │
│  │  • Understands regulatory requirement              │            │
│  │  • Searches product/policy coverage                │            │
│  │  • Identifies gaps semantically                    │            │
│  │  • Assesses risk levels                            │            │
│  │  • Generates recommendations                       │            │
│  └────────────────────────────────────────────────────┘            │
│                           ↓                                          │
│  ┌────────────────────────────────────────────────────┐            │
│  │        Generate Analysis Result                     │            │
│  │  • Compliance score (0-100)                        │            │
│  │  • List of gaps with details                       │            │
│  │  • Risk assessment                                 │            │
│  │  • Remediation steps                               │            │
│  │  • Executive summary                               │            │
│  └────────────────────────────────────────────────────┘            │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         OUTPUT LAYER                                │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐         │
│  │     JSON     │  │  Text Report │  │   Dashboard UI   │         │
│  │   Export     │  │   (Pretty)   │  │   Risk Cards     │         │
│  └──────────────┘  └──────────────┘  └──────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

## Detailed Analysis Flow

```
START: User uploads 3 documents
  │
  ├─→ Document 1: BNM Regulations (web_scrape.json)
  │    └─→ Contains: Obligations, Penalties, Requirements
  │
  ├─→ Document 2: Product Specification (product_spec.json)
  │    └─→ Contains: Features, Architecture, Data Pipeline
  │
  └─→ Document 3: Internal Policy (product_policy.json)
       └─→ Contains: Requirements, Controls, Procedures
  
  ↓
  
STEP 1: Initialize Analyzer
  ├─→ Load Anthropic SDK
  ├─→ Validate API key
  └─→ Prepare analysis context
  
  ↓
  
STEP 2: For Each Obligation (Loop)
  
  ┌─────────────────────────────────────────────┐
  │  Obligation: "Customer Due Diligence"      │
  │  Section: Section 16(1)                     │
  │  Risk Level: High                           │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  ┌─────────────────────────────────────────────┐
  │  Build Prompt for Claude                    │
  │  • Include obligation details               │
  │  • Include product features                 │
  │  • Include policy requirements              │
  │  • Ask for semantic analysis                │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  ┌─────────────────────────────────────────────┐
  │  Send to Claude AI                          │
  │  Model: claude-3-5-sonnet-20241022         │
  │  Temperature: 0.3 (deterministic)           │
  │  Max Tokens: 2000                           │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  ┌─────────────────────────────────────────────┐
  │  Claude Analyzes (10-20 seconds)            │
  │                                             │
  │  Question 1: Does product address this?    │
  │    → Searches features semantically         │
  │    → Checks data pipeline                   │
  │    → Evaluates architecture                 │
  │                                             │
  │  Question 2: Does policy cover this?       │
  │    → Searches requirements semantically     │
  │    → Checks procedures                      │
  │    → Evaluates controls                     │
  │                                             │
  │  Question 3: Is there a gap?               │
  │    → Complete coverage? ✅ No gap          │
  │    → Partial coverage? ⚠️ Medium gap       │
  │    → No coverage? 🔴 Critical gap          │
  │                                             │
  │  Question 4: What's the risk?              │
  │    → Regulatory penalties                   │
  │    → Financial impact                       │
  │    → Operational consequences               │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  ┌─────────────────────────────────────────────┐
  │  Claude Returns JSON Response               │
  │  {                                          │
  │    "has_gap": true/false,                  │
  │    "gap_type": "missing_feature",          │
  │    "severity": "high",                     │
  │    "gap_description": "...",               │
  │    "recommendation": "...",                │
  │    "confidence_score": 0.92                │
  │  }                                          │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  ┌─────────────────────────────────────────────┐
  │  Create ComplianceGap Object                │
  │  • Add regulation citation                  │
  │  • Add remediation steps                    │
  │  • Add risk assessment                      │
  │  • Generate unique gap_id                   │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  ┌─────────────────────────────────────────────┐
  │  Log Progress                               │
  │  ✅ Compliant OR ⚠️ Gap detected           │
  └─────────────────────────────────────────────┘
  
  ↓
  
REPEAT for next obligation...
  
  ↓
  
STEP 3: Calculate Compliance Score
  
  ┌─────────────────────────────────────────────┐
  │  Weighted Scoring                           │
  │  • Critical gaps: -4 points each            │
  │  • High gaps: -3 points each                │
  │  • Medium gaps: -2 points each              │
  │  • Low gaps: -1 point each                  │
  │                                             │
  │  Score = 100 - (deductions/max) × 100      │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  ┌─────────────────────────────────────────────┐
  │  Example:                                   │
  │  3 obligations analyzed                     │
  │  1 medium gap found                         │
  │  Score = 100 - (2/12) × 100 = 83%          │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  
STEP 4: Generate Executive Summary
  
  ┌─────────────────────────────────────────────┐
  │  Send all gaps to Claude                    │
  │  Ask for 2-3 sentence summary               │
  │  Claude generates readable summary          │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  
STEP 5: Compile Final Result
  
  ┌─────────────────────────────────────────────┐
  │  GapAnalysisResult {                        │
  │    audit_id: "AUD-1733512345678"           │
  │    compliance_score: 83                     │
  │    gaps_found: [...],                      │
  │    summary: {                              │
  │      total_gaps: 1,                        │
  │      critical_gaps: 0,                     │
  │      high_gaps: 0,                         │
  │      medium_gaps: 1                        │
  │    },                                       │
  │    recommendations_summary: "..."          │
  │  }                                          │
  └─────────────┬───────────────────────────────┘
                │
                ↓
  
STEP 6: Generate Outputs
  
  ┌────────────┬────────────┬────────────────┐
  │  JSON File │ Text Report│  Dashboard UI  │
  │  (API)     │ (Pretty)   │  (React)       │
  └────────────┴────────────┴────────────────┘
  
END: Return result to user
```

## Semantic Matching Example

### Example: "Record Keeping" Obligation

```
┌─────────────────────────────────────────────────────────────────┐
│  REGULATORY REQUIREMENT (Input)                                 │
├─────────────────────────────────────────────────────────────────┤
│  Obligation: Record Keeping                                     │
│  Description: "Maintain all records of transactions and CDD     │
│                information for at least 6 years."               │
│  Source: AMLA 2001, Section 17                                  │
│  Risk Level: Medium                                             │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  SEMANTIC SEARCH IN PRODUCT SPEC                                │
├─────────────────────────────────────────────────────────────────┤
│  Claude looks for:                                              │
│  ✓ Keywords: "retention", "archive", "storage", "records"      │
│  ✓ Related concepts: "backup", "audit trail", "history"        │
│  ✓ Time periods: "6 years", "72 months", "long-term"          │
│                                                                 │
│  Findings in Product Spec:                                      │
│  ❌ No mention of "retention"                                   │
│  ❌ No mention of "6 years"                                     │
│  ✓ "Convex DB" mentioned (storage exists)                      │
│  ⚠️ Pipeline has "outputs" but no retention policy             │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  SEMANTIC SEARCH IN PRODUCT POLICY                              │
├─────────────────────────────────────────────────────────────────┤
│  Claude looks for:                                              │
│  ✓ Keywords: "6 years", "retention", "record keeping"          │
│  ✓ Related concepts: "duration", "storage requirements"         │
│                                                                 │
│  Findings in Policy:                                            │
│  ✅ "duration_years": "6" FOUND                                 │
│  ✅ "records_required": [...] FOUND                             │
│  ✅ "storage_requirements": "encrypted" FOUND                   │
│                                                                 │
│  Assessment:                                                    │
│  • Policy HAS the requirement ✅                                │
│  • Product spec MISSING implementation ❌                       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  CLAUDE'S REASONING                                             │
├─────────────────────────────────────────────────────────────────┤
│  "The regulatory requirement mandates 6-year retention of       │
│   transaction records and CDD data. The internal policy         │
│   correctly specifies this 6-year duration and lists required   │
│   records. However, the product specification does not          │
│   explicitly describe how this retention period will be         │
│   enforced in the system architecture. While the product has    │
│   database storage (Convex DB), there is no mention of:         │
│   • Automated retention period tracking                         │
│   • Data deletion after 6 years                                 │
│   • Audit trail for record lifecycle                            │
│                                                                 │
│   This creates a MEDIUM severity gap because:                   │
│   - Policy is compliant ✅                                      │
│   - Product implementation is unclear ⚠️                        │
│   - System may not enforce the policy automatically ❌          │
│                                                                 │
│   Risk: During BNM audit, inability to demonstrate automated    │
│   compliance with retention requirements."                      │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  GENERATED GAP OBJECT (Output)                                  │
├─────────────────────────────────────────────────────────────────┤
│  {                                                              │
│    "gap_id": "GAP-1733512345-abc123",                          │
│    "gap_type": "incomplete_coverage",                          │
│    "severity": "medium",                                        │
│    "regulation": {                                              │
│      "name": "Record Keeping",                                  │
│      "section": "Section 17"                                    │
│    },                                                           │
│    "gap_description": "Product spec lacks explicit 6-year      │
│                        retention implementation",               │
│    "recommendation": "Add data retention module to             │
│                       architecture",                            │
│    "remediation_steps": [                                       │
│      "1. Document retention policy in product spec",           │
│      "2. Implement automated retention tracking",              │
│      "3. Add audit trail for deletions",                       │
│      "4. Configure backup systems",                            │
│      "5. Test enforcement mechanism"                           │
│    ],                                                           │
│    "confidence_score": 0.92                                     │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│ Regulations │──┐
│  (JSON)     │  │
└─────────────┘  │
                 │
┌─────────────┐  │     ┌──────────────────┐
│ Product     │──┼────→│  Gap Analyzer    │
│  Spec       │  │     │                  │
│  (JSON)     │  │     │  analyzeGaps()   │
└─────────────┘  │     └────────┬─────────┘
                 │              │
┌─────────────┐  │              │
│  Product    │──┘              │
│  Policy     │                 │
│  (JSON)     │                 │
└─────────────┘                 │
                                ↓
                    ┌───────────────────────┐
                    │   For Each Obligation │
                    └───────────┬───────────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │  analyzeObligation()  │
                    │                       │
                    │  1. Build prompt      │
                    │  2. Call Claude       │
                    │  3. Parse response    │
                    └───────────┬───────────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │   Claude AI API       │
                    │   (Anthropic)         │
                    │                       │
                    │   • Semantic search   │
                    │   • Gap detection     │
                    │   • Risk assessment   │
                    └───────────┬───────────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │  ComplianceGap[]      │
                    │  (Array of gaps)      │
                    └───────────┬───────────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │ calculateScore()      │
                    │ generateSummary()     │
                    └───────────┬───────────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │  GapAnalysisResult    │
                    │  • score: 85          │
                    │  • gaps: [...]        │
                    │  • summary: "..."     │
                    └───────────┬───────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ↓               ↓               ↓
        ┌──────────┐    ┌──────────┐   ┌──────────┐
        │   JSON   │    │  Report  │   │    UI    │
        │  Export  │    │  (Text)  │   │ Display  │
        └──────────┘    └──────────┘   └──────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│  • Next.js 16 (App Router)                                      │
│  • React 19                                                     │
│  • TypeScript 5                                                 │
│  • Tailwind CSS 4                                               │
│  • Shadcn UI Components                                         │
└─────────────────────────────────────────────────────────────────┘
                          ↓ API calls
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  • Next.js API Routes                                           │
│  • /api/compliance/analyze (POST)                               │
└─────────────────────────────────────────────────────────────────┘
                          ↓ uses
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  • ComplianceGapAnalyzer                                        │
│  • TypeScript Types (lib/types/compliance.ts)                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓ calls
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  • Anthropic Claude API                                         │
│  • Model: claude-3-5-sonnet-20241022                           │
│  • @anthropic-ai/sdk                                            │
└─────────────────────────────────────────────────────────────────┘
                          ↓ returns
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  • JSON exports                                                 │
│  • Text reports                                                 │
│  • File system (analysis_results/)                              │
│  • Future: Database (Convex/PostgreSQL)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- ✅ = Covered/Compliant
- ⚠️ = Partial coverage/Medium risk
- ❌ = Missing/Gap detected
- 🔴 = Critical severity
- 🟠 = High severity
- 🟡 = Medium severity
- 🟢 = Low severity

