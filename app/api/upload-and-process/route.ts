import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Claude AI configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ============================================
// COMPANY POLICY EXTRACTION PROMPT
// ============================================
const COMPANY_POLICY_PROMPT = `You are an expert compliance document analyzer specializing in AML/CFT policies for Malaysian fintech companies.

Analyze this PDF document and extract ALL company policies. Return valid JSON matching this EXACT structure:

{
  "companyName": "Full company name (e.g., 'PayNet Digital Sdn Bhd')",
  "submissionId": "SUB-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}",
  "submittedAt": "${new Date().toISOString()}",
  "policies": [
    {
      "policyId": "POL-KYC-001",
      "policyName": "Customer Due Diligence (CDD) Policy",
      "policyCategory": "AML/CFT",
      "description": "Policy governing the identification, verification, and ongoing monitoring of customer identities to prevent money laundering and terrorism financing.",
      "regulatoryCoverage": {
        "regulatorReferences": ["AMLA 2001 Section 16", "BNM AML/CFT Policy Document 2024", "FATF Recommendation 10"],
        "domains": ["KYC", "AML", "CTF", "RiskManagement"]
      },
      "applicability": {
        "appliesTo": ["All Customers", "Individual Accounts", "Corporate Accounts"],
        "riskLevel": "High"
      },
      "requirements": [
        {
          "requirementId": "REQ-KYC-001",
          "text": "Obtain full legal name as per NRIC/Passport for all new customers",
          "type": "Data"
        }
      ],
      "procedures": [
        {
          "procedureId": "PROC-KYC-001",
          "stepNumber": 1,
          "text": "Collect customer identification documents (NRIC/Passport)"
        }
      ],
      "dataInvolved": ["Full Name", "NRIC Number", "Date of Birth", "Residential Address"],
      "relatedProducts": ["e-Wallet", "Payment Gateway", "Remittance Service"],
      "relatedRisks": ["Identity Fraud", "Money Laundering", "Terrorism Financing"],
      "version": "1.0",
      "lastUpdated": "${new Date().toISOString().split('T')[0]}",
      "sourcePage": "Internal Policy Document Section X"
    }
  ]
}

CRITICAL INSTRUCTIONS:
1. Extract ALL policies mentioned in the document - look for:
   - KYC/CDD policies
   - STR (Suspicious Transaction Reporting) policies  
   - Record keeping policies
   - Transaction monitoring policies
   - Sanctions screening policies
   - Risk assessment policies
   - Training policies
   
2. For each policy, identify:
   - Policy category: "AML/CFT" | "Compliance" | "Risk Management" | "Data Privacy" | "Governance"
   - Risk level: "High" | "Medium" | "Low"
   - Requirement types: "Process" | "Data" | "Technical" | "Operational" | "Governance" | "HR"
   
3. Map regulatory references to actual regulations:
   - AMLA 2001 (Anti-Money Laundering, Anti-Terrorism Financing and Proceeds of Unlawful Activities Act)
   - BNM AML/CFT Policy Document
   - FATF Recommendations
   - PDPA 2010 (Personal Data Protection Act)
   
4. Generate sequential IDs: POL-KYC-001, POL-STR-001, REQ-XXX-001, PROC-XXX-001

5. Identify all domains covered: KYC, AML, CTF, DataPrivacy, Governance, ITSecurity, RiskManagement

6. Return ONLY valid JSON - no markdown, no code blocks, no explanations`;

// ============================================
// ALIGNMENT ANALYSIS PROMPT
// ============================================
const ALIGNMENT_ANALYSIS_PROMPT = `You are an expert compliance analyst specializing in Malaysian AML/CFT regulations.

Analyze the alignment between:
1. Company Policies (just uploaded)
2. Product Specifications (existing products)
3. Government Regulations (BNM requirements)

Return a JSON analysis:

{
  "alignmentScore": 85,
  "status": "partial",
  "productPolicyAlignments": [
    {
      "productFeature": "Digital Onboarding (e-KYC)",
      "productFeatureId": "FEAT-001",
      "alignedPolicy": "Customer Due Diligence (CDD) Policy",
      "alignedPolicyId": "POL-KYC-001",
      "alignmentStrength": "strong",
      "gaps": ["Missing biometric verification step in policy"],
      "recommendations": ["Add facial recognition requirements to CDD policy"]
    }
  ],
  "regulatoryAlignments": [
    {
      "companyPolicy": "Customer Due Diligence (CDD) Policy",
      "companyPolicyId": "POL-KYC-001",
      "regulationName": "AMLA 2001",
      "regulationSection": "Section 16",
      "alignmentStrength": "strong",
      "gaps": [],
      "citations": ["AMLA 2001 Section 16(1)"]
    }
  ],
  "criticalGaps": [
    {
      "area": "Transaction Monitoring",
      "description": "No policy for real-time transaction screening",
      "regulatoryRequirement": "BNM requires real-time screening for high-risk transactions",
      "severity": "high",
      "recommendation": "Implement transaction monitoring policy with real-time screening"
    }
  ],
  "summary": "Company policies are generally well-aligned with regulatory requirements. Key gap in transaction monitoring needs immediate attention."
}

COMPANY POLICIES:
${"{{COMPANY_POLICIES}}"}

PRODUCT SPECIFICATIONS:
${"{{PRODUCT_SPECS}}"}

GOVERNMENT REGULATIONS:
${"{{REGULATIONS}}"}

Analyze thoroughly and return ONLY valid JSON.`;

// ============================================
// PRODUCT SPEC EXTRACTION PROMPT
// ============================================
// Extraction prompt for Product Specs - matches the exact schema
const PRODUCT_SPEC_PROMPT = `You are an expert document analyzer specializing in fintech product specifications for AML/CFT compliance analysis.

Analyze this PDF document and extract structured information. Return it as valid JSON matching this EXACT structure:

{
  "companyName": "Full company name (e.g., 'PayNet Digital Sdn Bhd')",
  "registrationNumber": "Company registration number (e.g., '202001012345')",
  "incorporationCountry": "Country of incorporation (default: 'Malaysia')",
  "description": "Detailed company description covering business activities, licenses, and services offered",
  "industryCategory": "Industry category (e.g., 'Fintech - E-Money Issuer', 'Payment Service Provider', 'Digital Bank')",
  "productName": "Product/service name (e.g., 'PayNet e-Wallet')",
  "productVersion": "Version number (e.g., '2.5.0' or '1.0.0' if not found)",
  "productDescription": "Detailed product description including features and licensing",
  "submittedAt": "${new Date().toISOString()}",
  "features": [
    {
      "featureId": "FEAT-001",
      "name": "Feature name (e.g., 'Digital Onboarding (e-KYC)')",
      "description": "Detailed feature description",
      "dataUsed": ["Full Name", "NRIC Number", "Date of Birth", "Facial Biometrics", "Address", "Phone Number", "Email"],
      "userTypes": ["Individual Customers", "Small Business Owners"],
      "riskAreas": ["Identity Fraud", "Synthetic Identity", "Document Forgery"],
      "relatedPolicies": ["POL-KYC-001", "POL-REC-001"]
    }
  ],
  "financialOperations": [
    {
      "opId": "OP-001",
      "name": "Operation name (e.g., 'Wallet Top-Up')",
      "type": "Operation type: Funding | Disbursement | Transfer | Currency Exchange | Payment",
      "description": "Operation description",
      "dataUsed": ["Source Account", "Amount", "User Account"],
      "riskAreas": ["Structuring", "Source of Funds Concealment"],
      "relatedPolicies": ["POL-KYC-001", "POL-STR-001"]
    }
  ],
  "thirdPartyIntegrations": [
    {
      "name": "Integration name (e.g., 'MyKad Verification API (JPN)')",
      "purpose": "Purpose of integration",
      "dataShared": ["NRIC Number", "Full Name", "Date of Birth"],
      "riskAreas": ["Data Privacy", "API Security"],
      "relatedPolicies": ["POL-KYC-001", "POL-REC-001"]
    }
  ],
  "systemArchitecture": {
    "frontend": "Frontend technology stack (e.g., 'React Native mobile app with Next.js web dashboard')",
    "backend": "Backend technology stack (e.g., 'Node.js microservices on AWS EKS')",
    "databases": ["PostgreSQL (primary)", "Redis (caching)", "MongoDB (audit logs)"],
    "infrastructure": ["AWS (ap-southeast-1)", "CloudFlare CDN", "AWS WAF"],
    "securityControls": ["TLS 1.3 encryption", "OAuth 2.0 + PKCE", "HSM for key management", "PCI-DSS Level 1"]
  },
  "knownRisks": [
    "High transaction volume may exceed real-time screening capacity",
    "Cross-border remittance to high-risk corridors requires enhanced due diligence"
  ],
  "keywords": ["e-wallet", "e-money", "digital payments", "remittance", "DuitNow", "e-KYC", "AML", "CFT", "fintech"]
}

CRITICAL INSTRUCTIONS:
1. Extract ALL features mentioned - look for user flows, capabilities, services
2. Extract ALL financial operations - payments, transfers, top-ups, withdrawals, FX
3. Extract ALL third-party integrations - APIs, partners, vendors
4. Identify AML/CFT risk areas for EACH feature/operation:
   - Money Laundering, Terrorism Financing, Fraud, Identity Theft
   - Structuring, Mule Accounts, Sanctions Evasion
   - Transaction Laundering, Source of Funds issues
5. Generate sequential IDs: FEAT-001, FEAT-002... and OP-001, OP-002...
6. Use realistic policy references: POL-KYC-001, POL-STR-001, POL-REC-001
7. If information is not explicitly stated, make reasonable inferences based on the document context
8. Return ONLY valid JSON - no markdown, no code blocks, no explanations`;

/**
 * Process PDF with Claude AI directly (Claude can read PDFs)
 */
async function processPdfWithClaude(
  pdfBase64: string, 
  fileName: string, 
  prompt: string
): Promise<Record<string, unknown> | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log("[Claude] No API key configured");
    return null;
  }

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    console.log(`[Claude] Processing PDF: ${fileName}`);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract the text response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Claude] No JSON found in response');
      console.log('[Claude] Response:', responseText.substring(0, 500));
      return null;
    }

    const extractedData = JSON.parse(jsonMatch[0]);
    console.log('[Claude] Successfully extracted data');
    
    return extractedData;

  } catch (error) {
    console.error('[Claude] Processing error:', error);
    return null;
  }
}

/**
 * Run alignment analysis between company policies, product specs, and regulations
 */
async function runAlignmentAnalysis(
  companyPolicies: Record<string, unknown>,
  productSpecs: Record<string, unknown>[],
  regulations: Record<string, unknown>[]
): Promise<Record<string, unknown> | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log("[Claude] No API key for alignment analysis");
    return null;
  }

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    console.log("[Claude] Running alignment analysis...");

    // Build the prompt with actual data
    const prompt = ALIGNMENT_ANALYSIS_PROMPT
      .replace("${{COMPANY_POLICIES}}", JSON.stringify(companyPolicies, null, 2))
      .replace("${{PRODUCT_SPECS}}", JSON.stringify(productSpecs.slice(0, 5), null, 2)) // Limit to 5 products
      .replace("${{REGULATIONS}}", JSON.stringify(regulations.slice(0, 3), null, 2)); // Limit to 3 regulations

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Claude] No JSON found in alignment response');
      return null;
    }

    const analysisResult = JSON.parse(jsonMatch[0]);
    console.log('[Claude] Alignment analysis complete');
    
    return analysisResult;

  } catch (error) {
    console.error('[Claude] Alignment analysis error:', error);
    return null;
  }
}

/**
 * Upload PDF, process with Claude, save to Convex
 * Handles both Product Specs and Company Policies
 * POST /api/upload-and-process
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = (formData.get("documentType") as string) || "product-spec";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Validate file size (5MB max for Claude PDF processing to stay under context limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "File size exceeds 5MB limit. Please use a smaller PDF." 
      }, { status: 400 });
    }

    console.log(`[Upload] Starting upload for: ${file.name} (${file.size} bytes)`);
    console.log(`[Upload] Document type: ${documentType}`);

    // Check API key
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        error: "AI processing not configured. Please set ANTHROPIC_API_KEY." 
      }, { status: 500 });
    }

    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer();
    const pdfBase64 = Buffer.from(arrayBuffer).toString('base64');
    console.log(`[Upload] PDF converted to base64 (${pdfBase64.length} chars)`);

    // ============================================
    // COMPLIANCE POLICY PROCESSING
    // ============================================
    if (documentType === "compliance-policy") {
      console.log("[Claude] Processing as Compliance Policy...");
      
      const extractedData = await processPdfWithClaude(pdfBase64, file.name, COMPANY_POLICY_PROMPT);

      if (!extractedData) {
        return NextResponse.json({ 
          error: "Failed to extract policy data from PDF" 
        }, { status: 500 });
      }

      // Prepare data for companyPolicies table
      const companyPolicyData = {
        companyName: (extractedData.companyName as string) || "Unknown Company",
        submissionId: (extractedData.submissionId as string) || `SUB-${Date.now()}`,
        submittedAt: (extractedData.submittedAt as string) || new Date().toISOString(),
        policies: (extractedData.policies as Array<{
          policyId: string;
          policyName: string;
          policyCategory: string;
          description: string;
          regulatoryCoverage: {
            regulatorReferences: string[];
            domains: string[];
          };
          applicability: {
            appliesTo: string[];
            riskLevel: string;
          };
          requirements: Array<{
            requirementId: string;
            text: string;
            type: string;
          }>;
          procedures: Array<{
            procedureId: string;
            stepNumber: number;
            text: string;
          }>;
          dataInvolved: string[];
          relatedProducts: string[];
          relatedRisks: string[];
          version: string;
          lastUpdated: string;
          sourcePage: string;
        }>) || [],
        status: "submitted",
      };

      // Save to Convex companyPolicies table
      console.log("[Convex] Saving to companyPolicies table...");
      const companyPolicyId = await convex.mutation(api.companyPolicies.create, companyPolicyData);
      console.log("[Convex] Saved companyPolicy with ID:", companyPolicyId);

      // ============================================
      // RUN ALIGNMENT ANALYSIS
      // ============================================
      console.log("[Analysis] Fetching existing data for alignment analysis...");
      
      // Fetch existing product specs
      const productSpecs = await convex.query(api.productSpecs.list, { limit: 10 });
      
      // Fetch existing regulations
      const regulations = await convex.query(api.regulations.list, {});

      let alignmentAnalysis = null;
      if (productSpecs.length > 0 || regulations.length > 0) {
        console.log(`[Analysis] Running alignment against ${productSpecs.length} products and ${regulations.length} regulations...`);
        
        alignmentAnalysis = await runAlignmentAnalysis(
          companyPolicyData,
          productSpecs as Record<string, unknown>[],
          regulations as Record<string, unknown>[]
        );
      } else {
        console.log("[Analysis] No existing data for alignment - skipping analysis");
      }

      // Return response with alignment analysis
      return NextResponse.json({
        success: true,
        message: "Company policy uploaded and analyzed successfully!",
        companyPolicyId,
        documentType: "compliance-policy",
        data: {
          companyName: companyPolicyData.companyName,
          submissionId: companyPolicyData.submissionId,
          policiesCount: companyPolicyData.policies.length,
          policies: companyPolicyData.policies.map(p => ({
            policyId: p.policyId,
            policyName: p.policyName,
            category: p.policyCategory,
            riskLevel: p.applicability.riskLevel,
            requirementsCount: p.requirements.length,
            proceduresCount: p.procedures.length,
            domains: p.regulatoryCoverage.domains,
          })),
        },
        alignmentAnalysis: alignmentAnalysis || {
          status: "pending",
          message: "No existing products or regulations to compare against. Upload product specs and regulations first.",
        },
        file: {
          name: file.name,
          size: file.size,
        },
      });
    }

    // ============================================
    // PRODUCT SPEC PROCESSING (default)
    // ============================================
    console.log("[Claude] Processing as Product Spec...");
    const extractedData = await processPdfWithClaude(pdfBase64, file.name, PRODUCT_SPEC_PROMPT);

    if (!extractedData) {
      return NextResponse.json({ 
        error: "Failed to extract structured data from PDF" 
      }, { status: 500 });
    }

    // Prepare data for productSpecs table
    const now = new Date().toISOString();
    const productSpecData = {
      companyName: (extractedData.companyName as string) || "Unknown Company",
      registrationNumber: (extractedData.registrationNumber as string) || `REG-${Date.now()}`,
      incorporationCountry: (extractedData.incorporationCountry as string) || "Malaysia",
      description: (extractedData.description as string) || "",
      industryCategory: (extractedData.industryCategory as string) || "Fintech",
      productName: (extractedData.productName as string) || file.name.replace(".pdf", ""),
      productVersion: (extractedData.productVersion as string) || "1.0.0",
      productDescription: (extractedData.productDescription as string) || "",
      submittedAt: now,
      features: (extractedData.features as Array<{
        featureId: string;
        name: string;
        description: string;
        dataUsed: string[];
        userTypes: string[];
        riskAreas: string[];
        relatedPolicies: string[];
      }>) || [],
      financialOperations: (extractedData.financialOperations as Array<{
        opId: string;
        name: string;
        type: string;
        description: string;
        dataUsed: string[];
        riskAreas: string[];
        relatedPolicies: string[];
      }>) || [],
      thirdPartyIntegrations: (extractedData.thirdPartyIntegrations as Array<{
        name: string;
        purpose: string;
        dataShared: string[];
        riskAreas: string[];
        relatedPolicies: string[];
      }>) || [],
      systemArchitecture: (extractedData.systemArchitecture as {
        frontend: string;
        backend: string;
        databases: string[];
        infrastructure: string[];
        securityControls: string[];
      }) || {
        frontend: "",
        backend: "",
        databases: [],
        infrastructure: [],
        securityControls: [],
      },
      knownRisks: (extractedData.knownRisks as string[]) || [],
      keywords: (extractedData.keywords as string[]) || [],
      status: "submitted",
    };

    // Save to Convex productSpecs table
    console.log("[Convex] Saving to productSpecs table...");
    const productSpecId = await convex.mutation(api.productSpecs.create, productSpecData);
    console.log("[Convex] Saved productSpec with ID:", productSpecId);

    // Return response
    return NextResponse.json({
      success: true,
      message: "PDF uploaded and converted to productSpec successfully!",
      productSpecId,
      documentType: "product-spec",
      data: {
        companyName: productSpecData.companyName,
        productName: productSpecData.productName,
        featuresCount: productSpecData.features.length,
        operationsCount: productSpecData.financialOperations.length,
        integrationsCount: productSpecData.thirdPartyIntegrations.length,
        risksCount: productSpecData.knownRisks.length,
      },
      file: {
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

/**
 * Get productSpec by ID
 * GET /api/upload-and-process?id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      // Return list of productSpecs
      const productSpecs = await convex.query(api.productSpecs.list, { limit: 50 });
      return NextResponse.json({ success: true, productSpecs });
    }

    // Get specific productSpec
    const productSpec = await convex.query(api.productSpecs.getById, {
      id: id as any,
    });

    if (!productSpec) {
      return NextResponse.json({ error: "ProductSpec not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, productSpec });
  } catch (error) {
    console.error("[GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to get productSpec" },
      { status: 500 }
    );
  }
}
