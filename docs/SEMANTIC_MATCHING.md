# Compliance Gap Analysis - Semantic Matching

This directory contains the implementation of semantic compliance gap detection using Claude AI.

## Overview

The Compliance Gap Analyzer uses Claude's advanced language understanding to perform semantic analysis between:
- **BNM Regulations** (from web scraping)
- **Product Specifications** (your banking features)
- **Internal Policies** (your compliance policies)

## Features

✅ **Semantic Understanding** - Goes beyond keyword matching to understand regulatory intent  
✅ **Precise Citations** - Every gap includes exact regulatory section references  
✅ **Risk Assessment** - Evaluates regulatory, financial, and operational risks  
✅ **Confidence Scoring** - AI provides confidence levels for each finding  
✅ **Actionable Recommendations** - Step-by-step remediation guidance  

## Files Created

```
lib/
├── types/
│   └── compliance.ts                    # TypeScript type definitions
├── compliance-gap-analyzer.ts           # Main analyzer service with Claude AI

app/
└── api/
    └── compliance/
        └── analyze/
            └── route.ts                 # Next.js API endpoint

scripts/
└── test-gap-analysis.ts                 # Test script to run analysis

mock_data/
├── web_scrape.json                      # BNM AMLA regulations
├── product_spec.json                    # Veris product specification
└── product_policy.json                  # Internal CDD policy
```

## Setup

### 1. Install Dependencies

Already done! The Anthropic SDK has been installed:
```bash
npm install @anthropic-ai/sdk
```

### 2. Set Your Anthropic API Key

Get your API key from: https://console.anthropic.com/

```bash
# Add to .env.local
ANTHROPIC_API_KEY=your-api-key-here
```

Or set as environment variable:
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

## Usage

### Option 1: Run the Test Script (Recommended)

```bash
npm run analyze-compliance
```

This will:
1. Load the mock data from `mock_data/`
2. Analyze all regulatory obligations
3. Generate a detailed report
4. Save results to `analysis_results/`

### Option 2: Use the API Endpoint

Start the dev server:
```bash
npm run dev
```

Make a POST request:
```bash
curl -X POST http://localhost:3000/api/compliance/analyze \
  -H "Content-Type: application/json" \
  -d @payload.json
```

Where `payload.json` contains:
```json
{
  "regulations": { /* web_scrape.json content */ },
  "productSpec": { /* product_spec.json content */ },
  "productPolicy": { /* product_policy.json content */ }
}
```

### Option 3: Use Programmatically

```typescript
import { ComplianceGapAnalyzer } from '@/lib/compliance-gap-analyzer';

const analyzer = new ComplianceGapAnalyzer();

const result = await analyzer.analyzeGaps(
  regulations,
  productSpec,
  productPolicy
);

console.log(analyzer.generateReport(result));
```

## How It Works

### 1. Semantic Analysis Process

For each regulatory obligation, Claude AI:

1. **Understands the Regulation** - Parses the obligation's requirements
2. **Searches Product/Policy** - Looks for relevant coverage semantically
3. **Identifies Gaps** - Determines if coverage is adequate
4. **Assesses Risk** - Evaluates severity and impact
5. **Generates Recommendations** - Provides actionable remediation steps

### 2. Gap Detection Logic

```typescript
// Claude analyzes each obligation with this workflow:
Obligation → 
  ↓
  Product Features Coverage? (semantic match)
  ↓
  Internal Policy Coverage? (semantic match)
  ↓
  Gap Detected? → Severity Assessment
  ↓
  Risk Assessment → Recommendations
```

### 3. Output Format

```json
{
  "audit_id": "AUD-1733512345678",
  "compliance_score": 85,
  "gaps_found": [
    {
      "gap_id": "GAP-...",
      "severity": "high",
      "gap_description": "Missing 6-year retention policy",
      "regulation": {
        "name": "Record Keeping",
        "section": "Section 17"
      },
      "recommendation": "Implement data retention module",
      "remediation_steps": ["Step 1", "Step 2"],
      "confidence_score": 0.92
    }
  ]
}
```

## Example Analysis

Based on your mock data, the analyzer will check:

### ✅ Obligations Analyzed:
1. **Suspicious Transaction Reporting** (Section 14)
2. **Customer Due Diligence** (Section 16)
3. **Record Keeping** (Section 17)

### 🔍 What It Checks:

**For "Record Keeping" obligation:**
- Does product spec mention data retention?
- Does policy specify 6-year retention period?
- Are storage requirements documented?

**Semantic Understanding:**
- "6 years" = "72 months" (understands equivalence)
- "Transaction records" includes "audit trails" (contextual)
- "Digital storage" satisfies "electronic records" requirement

## Compliance Score Calculation

The score is weighted by severity:

```
Score = 100 - (weighted deductions / max possible) * 100

Weights:
- Critical: 4 points
- High: 3 points
- Medium: 2 points
- Low: 1 point
```

**Score Interpretation:**
- **90-100**: Excellent compliance ✅
- **70-89**: Good, minor gaps ⚠️
- **50-69**: Moderate, action needed 🔶
- **0-49**: Critical issues 🔴

## API Response Examples

### Success Response (200)
```json
{
  "audit_id": "AUD-1733512345678",
  "audit_date": "2024-12-06T...",
  "product_name": "Veris Compliance Engine",
  "compliance_score": 85,
  "gaps_found": [...],
  "summary": {
    "total_gaps": 3,
    "critical_gaps": 0,
    "high_gaps": 1,
    "medium_gaps": 2,
    "low_gaps": 0
  }
}
```

### Error Response (400/500)
```json
{
  "error": "Missing required fields",
  "message": "Please provide regulations, productSpec, and productPolicy"
}
```

## Testing

Run the test script to see semantic matching in action:

```bash
# Make sure ANTHROPIC_API_KEY is set
export ANTHROPIC_API_KEY="your-key"

# Run analysis
npm run analyze-compliance
```

Expected output:
```
📁 Loading mock data...
✅ Data loaded successfully
🤖 Initializing Compliance Gap Analyzer...

🔍 Analyzing: Suspicious Transaction Reporting
✅ Compliant

🔍 Analyzing: Customer Due Diligence
✅ Compliant

🔍 Analyzing: Record Keeping
⚠️  Gap detected: MEDIUM

📊 ANALYSIS COMPLETE!
Compliance Score: 85/100
```

## Advanced Features

### Custom Prompts

The analyzer uses carefully crafted prompts that:
- Provide full context from all three documents
- Ask Claude to think step-by-step
- Request structured JSON responses
- Include confidence scores

### Citation Tracking

Every gap includes:
- Exact section reference (e.g., "Section 16(1)")
- Source regulation name
- Link to original document (if available)

### Confidence Scoring

Claude provides a 0-1 confidence score for each finding:
- **0.9-1.0**: Very confident
- **0.7-0.89**: Confident
- **0.5-0.69**: Moderate confidence
- **< 0.5**: Low confidence (may need human review)

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY is not set"
**Solution:** Set your API key:
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Issue: "Module not found"
**Solution:** Ensure tsx is installed:
```bash
npm install tsx --save-dev
```

### Issue: Analysis takes too long
**Solution:** The analyzer processes each obligation sequentially. For 3 obligations, expect 30-60 seconds.

## Next Steps

1. ✅ Run the test script to see it in action
2. Integrate with your upload workflow
3. Add vector embeddings for faster semantic search (optional)
4. Create a dashboard to display results visually
5. Add webhook notifications for critical gaps

## Architecture Notes

This implementation uses Claude's **direct API** approach (not RAG with vector DB yet). Future enhancements:

- **Phase 2**: Add Pinecone/Weaviate for vector search
- **Phase 3**: Implement caching for repeated queries
- **Phase 4**: Multi-document batch analysis

## License

Proprietary - Veris Compliance Engine

---

Built with ❤️ using Claude AI for Malaysian Banking Compliance

