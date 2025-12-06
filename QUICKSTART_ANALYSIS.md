# Quick Start: Run Semantic Compliance Gap Analysis

## Prerequisites

You need an Anthropic API key to use Claude AI.

### Get Your API Key

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new key
5. Copy it (starts with `sk-ant-...`)

## Step 1: Set Your API Key

Add to your `.env.local` file:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Or set as environment variable:

```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

## Step 2: Run the Analysis

```bash
npm run analyze-compliance
```

## What You'll See

```
📁 Loading mock data...

✅ Data loaded successfully
   • Regulation: Anti-Money Laundering, Anti-Terrorism Financing and Proceeds of Unlawful Activities Act 2001
   • Product: Veris Compliance Engine
   • Policy: Standard Customer Due Diligence (CDD) Policy

🤖 Initializing Compliance Gap Analyzer with Claude AI...

═══════════════════════════════════════════════════════════════════════

🔍 Starting compliance gap analysis...
📋 Analyzing 3 regulatory obligations

🔎 Analyzing: Suspicious Transaction Reporting
✅ Compliant

🔎 Analyzing: Customer Due Diligence (CDD)
✅ Compliant

🔎 Analyzing: Record Keeping
⚠️  Gap detected: MEDIUM


═══════════════════════════════════════════════════════════════════════

📊 ANALYSIS COMPLETE!

╔══════════════════════════════════════════════════════════════════════╗
║                   COMPLIANCE GAP ANALYSIS REPORT                     ║
╚══════════════════════════════════════════════════════════════════════╝

Audit ID: AUD-1733512345678
Date: 12/6/2024, 10:30:00 AM
Product: Veris Compliance Engine
Regulation: AMLA 2001

═══════════════════════════════════════════════════════════════════════

COMPLIANCE SCORE: 85/100

SUMMARY:
--------
Total Gaps Found: 1
  • Critical: 0
  • High: 0
  • Medium: 1
  • Low: 0

EXECUTIVE SUMMARY:
------------------
The product demonstrates strong compliance with most AML/CFT requirements. 
However, the data retention policy needs explicit documentation to meet 
the 6-year record keeping requirement under Section 17.

═══════════════════════════════════════════════════════════════════════

DETAILED FINDINGS:
------------------

1. 🟡 [MEDIUM] Record Keeping
   ----------------------------------------------------------------------
   
   Gap Description:
   Product specification does not explicitly mention 6-year data 
   retention requirements for transaction records and CDD documentation.
   
   Current State:
   Data pipeline includes processing and outputs but lacks retention 
   policy documentation. Policy specifies 6-year retention but product 
   spec doesn't reflect implementation details.
   
   Regulatory Citation:
   Anti-Money Laundering Act 2001, Section 17
   
   Risk Assessment:
   • Regulatory Risk: Non-compliance with mandatory retention period
   • Financial Impact: Potential fines up to RM 1 million
   • Operational Impact: Unable to produce records during BNM audit
   
   Recommendation:
   Add explicit data retention module to product architecture with 
   automated retention period enforcement and audit trail capabilities.
   
   Remediation Steps:
      1. Document retention policy in product specification
      2. Implement automated retention period tracking
      3. Add audit trail for record deletion after 6 years
      4. Configure backup and archival systems
      5. Test retention enforcement mechanism
   
   Confidence Score: 92.0%

═══════════════════════════════════════════════════════════════════════

Next Review Date: 12/6/2025

═══════════════════════════════════════════════════════════════════════

💾 Results saved:
   • JSON: analysis_results/gap_analysis_2024-12-06T10-30-00.json
   • Report: analysis_results/gap_analysis_2024-12-06T10-30-00.txt

📈 QUICK SUMMARY:
   Compliance Score: 85/100
   Total Gaps: 1
   Critical: 0 | High: 0 | Medium: 1 | Low: 0

⚠️  Good compliance, but several gaps need attention.
```

## Step 3: Review Results

Results are automatically saved to `analysis_results/`:
- **JSON file**: Machine-readable format for integration
- **TXT file**: Human-readable report

## Using the API

Start the dev server:
```bash
npm run dev
```

Test the endpoint:
```bash
curl http://localhost:3000/api/compliance/analyze
```

Make an analysis request:
```bash
curl -X POST http://localhost:3000/api/compliance/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "regulations": { /* your web_scrape.json */ },
    "productSpec": { /* your product_spec.json */ },
    "productPolicy": { /* your product_policy.json */ }
  }'
```

## Troubleshooting

### "ANTHROPIC_API_KEY is not set"
Make sure you've added it to `.env.local` or exported it:
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Module not found errors
Run:
```bash
npm install
```

### Permission issues
The script will create `analysis_results/` directory automatically.

## Next Steps

1. ✅ Review the generated report
2. Implement recommended remediation steps
3. Re-run analysis to verify compliance improvements
4. Integrate with your document upload workflow
5. Schedule regular compliance audits

---

**Need help?** See `docs/SEMANTIC_MATCHING.md` for detailed documentation.

