import { mutation } from "./_generated/server";

/**
 * Seed mutation to populate the database with mock data
 * Run this from the Convex dashboard: Functions > seed > seedAll > Run
 */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Check if data already exists
    const existingRegulations = await ctx.db.query("regulations").first();
    const existingProducts = await ctx.db.query("productSpecs").first();
    const existingPolicies = await ctx.db.query("companyPolicies").first();

    const results = {
      regulations: null as string | null,
      productSpecs: null as string | null,
      companyPolicies: null as string | null,
      skipped: [] as string[],
    };

    // ==========================================
    // Seed Regulations (WebData)
    // ==========================================
    if (existingRegulations) {
      results.skipped.push("regulations (already exists)");
    } else {
      const regulationId = await ctx.db.insert("regulations", {
        act_name: "Anti-Money Laundering, Anti-Terrorism Financing and Proceeds of Unlawful Activities Act 2001 (AMLA)",
        jurisdiction: "Malaysia",
        version: "2024 Revised Edition (Act 613)",
        last_updated: "2024-01-15",
        definitions: [
          {
            term: "Money Laundering",
            meaning: "The act of engaging, directly or indirectly, in a transaction that involves proceeds of an unlawful activity or instrumentalities of an offence; or acquiring, receiving, possessing, disguising, transferring, converting, exchanging, carrying, disposing, or using proceeds of an unlawful activity.",
            source_section: "Section 3"
          },
          {
            term: "Reporting Institution",
            meaning: "Any person, including branches and subsidiaries outside Malaysia of a reporting institution incorporated in Malaysia, who carries on any activity listed in the First Schedule and includes a person who is a participant in a payment system.",
            source_section: "Section 3"
          },
          {
            term: "Customer Due Diligence (CDD)",
            meaning: "The process of identifying and verifying the customer's identity, the beneficial owner's identity, understanding the nature and purpose of business relationship, and conducting ongoing monitoring of transactions.",
            source_section: "Section 16"
          },
          {
            term: "Beneficial Owner",
            meaning: "The natural person who ultimately owns or controls a customer or the natural person on whose behalf a transaction is being conducted, including any person who exercises ultimate effective control over a legal person or arrangement.",
            source_section: "Section 3"
          },
          {
            term: "Politically Exposed Person (PEP)",
            meaning: "An individual who is or has been entrusted with prominent public functions including heads of state, senior politicians, senior government or judicial officials, senior executives of state-owned corporations, and important political party officials.",
            source_section: "BNM Policy Document Para 10.4"
          },
          {
            term: "Suspicious Transaction Report (STR)",
            meaning: "A report submitted by a reporting institution to the competent authority when there is reason to suspect that a transaction involves proceeds from an unlawful activity, is intended for terrorism financing, or the customer is engaged in money laundering activities.",
            source_section: "Section 14"
          }
        ],
        obligations: [
          {
            name: "Customer Due Diligence (CDD)",
            description: "Reporting institutions must conduct CDD when establishing business relations, carrying out transactions above prescribed threshold, there is suspicion of ML/TF, or doubts about previously obtained information.",
            applies_to: ["Licensed Banks", "Insurance Companies", "Securities Firms", "E-Money Issuers", "Money Services Business", "Designated Non-Financial Businesses"],
            source_section: "Section 16(1)",
            risk_level: "High"
          },
          {
            name: "Suspicious Transaction Reporting",
            description: "Reporting institutions must promptly report any transaction that gives reason to suspect it involves proceeds of an unlawful activity, terrorism financing, or that the customer is engaged in money laundering.",
            applies_to: ["All Reporting Institutions"],
            source_section: "Section 14(1)",
            risk_level: "High"
          },
          {
            name: "Record Keeping",
            description: "Maintain all records of transactions, CDD information, account files, and business correspondence for at least 6 years from the date the transaction is completed or business relationship is terminated.",
            applies_to: ["All Reporting Institutions"],
            source_section: "Section 17",
            risk_level: "Medium"
          },
          {
            name: "Enhanced Due Diligence (EDD)",
            description: "Apply enhanced measures for higher risk categories including PEPs, correspondent banking relationships, non-face-to-face transactions, and customers from high-risk countries.",
            applies_to: ["All Reporting Institutions"],
            source_section: "Section 16(2) and BNM Policy Document",
            risk_level: "High"
          },
          {
            name: "Compliance Programme",
            description: "Establish and maintain internal policies, procedures, and controls to detect and prevent ML/TF, including appointment of a compliance officer at management level.",
            applies_to: ["All Reporting Institutions"],
            source_section: "Section 19",
            risk_level: "High"
          },
          {
            name: "Employee Training",
            description: "Provide regular training to employees on AML/CFT obligations, red flag indicators, internal reporting procedures, and updates on regulatory requirements.",
            applies_to: ["All Reporting Institutions"],
            source_section: "Section 19(c)",
            risk_level: "Medium"
          }
        ],
        procedures: [
          {
            name: "STR Filing Process",
            steps: [
              "Identify suspicious activity through transaction monitoring or staff observation",
              "Document the basis of suspicion with supporting evidence",
              "Conduct internal investigation without alerting the customer",
              "Compliance Officer reviews and validates the suspicion",
              "MLRO approves the STR for submission",
              "Submit STR to BNM via Financial Intelligence Network System (FINS)",
              "Maintain confidentiality - do not disclose filing to customer or third parties",
              "Archive STR and supporting documents with restricted access"
            ],
            conditions: "Must be submitted within 24 hours of forming suspicion. Urgent cases involving terrorism financing require immediate submission.",
            source_section: "Section 14 and BNM STR Guidelines"
          },
          {
            name: "CDD Verification Process",
            steps: [
              "Collect customer identification documents (NRIC/Passport for individuals, incorporation documents for corporates)",
              "Verify identity against reliable independent sources",
              "Identify beneficial owners for legal persons and arrangements",
              "Understand the purpose and intended nature of business relationship",
              "Screen against sanction lists, PEP databases, and adverse media",
              "Assess and assign customer risk rating",
              "Obtain senior management approval for high-risk customers",
              "Document all verification steps and retain records"
            ],
            conditions: "Must be completed before establishing business relationship. Simplified CDD may apply for verified low-risk scenarios.",
            source_section: "Section 16 and BNM CDD Guidelines"
          },
          {
            name: "PEP Identification and Approval",
            steps: [
              "Screen customer and beneficial owners against PEP databases",
              "Determine if PEP is foreign, domestic, or international organization",
              "Obtain senior management approval before establishing relationship",
              "Establish source of wealth and source of funds",
              "Apply enhanced ongoing monitoring measures",
              "Conduct annual review of PEP relationship"
            ],
            conditions: "Applies to all categories of PEPs including family members and close associates.",
            source_section: "BNM Policy Document Para 10.4-10.8"
          }
        ],
        offences: [
          {
            offence: "Money Laundering",
            description: "Engaging in or attempting to engage in money laundering, including acquiring, receiving, possessing, disguising, transferring, converting, or using proceeds of unlawful activity.",
            source_section: "Section 4(1)"
          },
          {
            offence: "Terrorism Financing",
            description: "Providing, collecting, or possessing property with intention or knowledge that it will be used to facilitate terrorism or by terrorists.",
            source_section: "Section 130N (Penal Code, cross-referenced)"
          },
          {
            offence: "Tipping Off",
            description: "Disclosing to any person information that is likely to prejudice an investigation, including disclosure that an STR has been filed.",
            source_section: "Section 35"
          },
          {
            offence: "Failure to Report Suspicious Transaction",
            description: "Failing to report to BNM a transaction that the reporting institution has reason to suspect involves proceeds of unlawful activity.",
            source_section: "Section 14(b)"
          },
          {
            offence: "Failure to Conduct CDD",
            description: "Establishing or continuing a business relationship without conducting adequate customer due diligence measures.",
            source_section: "Section 16(3)"
          },
          {
            offence: "Failure to Keep Records",
            description: "Failing to maintain records of transactions and CDD information for the prescribed retention period.",
            source_section: "Section 17(4)"
          }
        ],
        penalties: [
          {
            offence: "Money Laundering",
            fine_amount: "Up to RM 5,000,000",
            imprisonment_term: "Up to 15 years",
            corporate_penalty: "Fine up to RM 5,000,000 or five times the value of the proceeds or instrumentalities, whichever is higher",
            source_section: "Section 4(1)"
          },
          {
            offence: "Failure to Report Suspicious Transaction",
            fine_amount: "Up to RM 3,000,000",
            imprisonment_term: "Up to 5 years",
            corporate_penalty: "Up to RM 3,000,000",
            source_section: "Section 14(b)"
          },
          {
            offence: "Tipping Off",
            fine_amount: "Up to RM 3,000,000",
            imprisonment_term: "Up to 5 years",
            corporate_penalty: "Up to RM 3,000,000",
            source_section: "Section 35"
          },
          {
            offence: "Failure to Conduct CDD",
            fine_amount: "Up to RM 1,000,000",
            imprisonment_term: "Up to 1 year",
            corporate_penalty: "Up to RM 1,000,000 for first offence; up to RM 3,000,000 for subsequent offences",
            source_section: "Section 16(3)"
          },
          {
            offence: "Failure to Keep Records",
            fine_amount: "Up to RM 1,000,000",
            imprisonment_term: "Up to 1 year",
            corporate_penalty: "Up to RM 1,000,000",
            source_section: "Section 17(4)"
          }
        ],
        recordkeeping_requirements: {
          retention_period: "6 years",
          conditions: "From the date the transaction is completed or the business relationship is terminated, whichever is later. Records must be sufficient to permit reconstruction of individual transactions and must be readily available to competent authorities upon request.",
          source_section: "Section 17(1) and (2)"
        },
        applicability: [
          {
            entity_type: "Licensed Banks and Financial Institutions",
            obligations: ["Full CDD", "EDD for high-risk", "STR Reporting", "Record Keeping", "Compliance Programme", "Employee Training", "Independent Audit"],
            exemptions: ["Simplified CDD for certain low-risk government-related entities"]
          },
          {
            entity_type: "E-Money Issuers",
            obligations: ["Full CDD", "Transaction Limits for non-verified", "STR Reporting", "Record Keeping", "Real-time Transaction Monitoring"],
            exemptions: ["Tiered CDD based on wallet limits as per BNM e-Money Guidelines"]
          },
          {
            entity_type: "Money Services Business",
            obligations: ["Full CDD", "EDD for all cross-border transactions", "STR Reporting", "Record Keeping", "Agent Due Diligence"],
            exemptions: []
          },
          {
            entity_type: "Designated Non-Financial Businesses and Professions (DNFBPs)",
            obligations: ["CDD when transaction exceeds threshold", "STR Reporting", "Record Keeping"],
            exemptions: ["Lawyers exempt when ascertaining legal position for client"]
          }
        ],
        exceptions: [
          {
            description: "Simplified CDD may be applied for customers that are Malaysian federal or state government entities, statutory bodies, or companies listed on Bursa Malaysia.",
            source_section: "BNM Policy Document Para 9.1"
          },
          {
            description: "Legal professionals are not required to report suspicious transactions when the information was obtained in privileged circumstances in connection with legal proceedings.",
            source_section: "Section 14(5)"
          },
          {
            description: "E-money accounts with maximum stored value of RM200 and monthly transaction limit of RM1,000 may apply tiered CDD requirements.",
            source_section: "BNM e-Money Guidelines Para 12.3"
          }
        ],
        cross_references: [
          {
            reference_type: "Guideline",
            related_document: "BNM Policy Document on Anti-Money Laundering, Countering Financing of Terrorism and Targeted Financial Sanctions (AML/CFT/TFS)",
            description: "Detailed implementation guidance for reporting institutions on CDD, ongoing monitoring, and risk assessment requirements."
          },
          {
            reference_type: "Guideline",
            related_document: "BNM e-Money Guidelines",
            description: "Specific requirements for e-money issuers including tiered CDD, transaction limits, and agent oversight."
          },
          {
            reference_type: "Act",
            related_document: "Penal Code (Act 574) - Chapter VIA",
            description: "Terrorism and terrorism financing offences referenced in AMLA for TF-related provisions."
          },
          {
            reference_type: "International Standard",
            related_document: "FATF Recommendations",
            description: "International AML/CFT standards which Malaysia is committed to implementing as a FATF member."
          },
          {
            reference_type: "Regulation",
            related_document: "United Nations Security Council Resolutions",
            description: "Sanctions lists and targeted financial sanctions that reporting institutions must screen against."
          }
        ],
        source_url: "https://amlcft.bnm.gov.my/the-amla",
        scraped_at: new Date().toISOString(),
        pdf_filename: "AMLA_2001_Revised_2024.pdf",
      });
      results.regulations = regulationId;
    }

    // ==========================================
    // Seed Product Specs
    // ==========================================
    if (existingProducts) {
      results.skipped.push("productSpecs (already exists)");
    } else {
      const productId = await ctx.db.insert("productSpecs", {
        companyName: "PayNet Digital Sdn Bhd",
        registrationNumber: "202001012345",
        incorporationCountry: "Malaysia",
        description: "A licensed e-money issuer providing digital payment solutions including e-wallets, payment gateway services, and cross-border remittance for Malaysian consumers and businesses.",
        industryCategory: "Fintech - E-Money Issuer",
        productName: "PayNet e-Wallet",
        productVersion: "2.5.0",
        productDescription: "Mobile-first digital wallet application enabling users to store funds, make payments, transfer money, and access financial services. Licensed under BNM e-Money Guidelines.",
        submittedAt: new Date().toISOString(),
        features: [
          {
            featureId: "FEAT-001",
            name: "Digital Onboarding (e-KYC)",
            description: "Allows users to register and verify identity using facial recognition and document scanning without visiting a physical branch.",
            dataUsed: ["Full Name", "NRIC Number", "Date of Birth", "Facial Biometrics", "Address", "Phone Number", "Email"],
            userTypes: ["Individual Customers", "Small Business Owners"],
            riskAreas: ["Identity Fraud", "Synthetic Identity", "Document Forgery"],
            relatedPolicies: ["POL-KYC-001", "POL-REC-001"]
          },
          {
            featureId: "FEAT-002",
            name: "Peer-to-Peer Transfer",
            description: "Enables instant money transfers between registered users using phone number or QR code.",
            dataUsed: ["Sender Account", "Recipient Identifier", "Amount", "Transaction Timestamp", "Device Fingerprint"],
            userTypes: ["Individual Customers"],
            riskAreas: ["Money Laundering", "Structuring", "Mule Accounts"],
            relatedPolicies: ["POL-STR-001", "POL-KYC-001"]
          },
          {
            featureId: "FEAT-003",
            name: "Bill Payments",
            description: "Allows users to pay utility bills, telco bills, and government services directly from the wallet.",
            dataUsed: ["Biller Account Number", "Payment Amount", "User Account", "Transaction Reference"],
            userTypes: ["Individual Customers", "Small Business Owners"],
            riskAreas: ["Payment Fraud", "Account Takeover"],
            relatedPolicies: ["POL-REC-001"]
          },
          {
            featureId: "FEAT-004",
            name: "Cross-Border Remittance",
            description: "International money transfer service to selected countries with real-time exchange rates.",
            dataUsed: ["Sender KYC Data", "Beneficiary Name", "Beneficiary Bank Details", "Purpose of Transfer", "Source of Funds"],
            userTypes: ["Individual Customers", "Migrant Workers"],
            riskAreas: ["Terrorism Financing", "Sanctions Evasion", "Trade-Based ML"],
            relatedPolicies: ["POL-KYC-001", "POL-STR-001"]
          },
          {
            featureId: "FEAT-005",
            name: "Merchant QR Payments",
            description: "DuitNow QR integration allowing users to pay at participating merchants nationwide.",
            dataUsed: ["Merchant ID", "Transaction Amount", "User Account", "Location Data", "Timestamp"],
            userTypes: ["Individual Customers"],
            riskAreas: ["Merchant Fraud", "Transaction Laundering"],
            relatedPolicies: ["POL-STR-001"]
          }
        ],
        financialOperations: [
          {
            opId: "OP-001",
            name: "Wallet Top-Up",
            type: "Funding",
            description: "Users can add funds to their wallet via bank transfer, debit card, or cash at partner outlets.",
            dataUsed: ["Source Account", "Amount", "User Account", "Top-Up Channel"],
            riskAreas: ["Structuring", "Source of Funds Concealment"],
            relatedPolicies: ["POL-KYC-001", "POL-STR-001"]
          },
          {
            opId: "OP-002",
            name: "Cash Withdrawal",
            type: "Disbursement",
            description: "Users can withdraw cash at partner ATMs and retail outlets.",
            dataUsed: ["User Account", "Withdrawal Amount", "Withdrawal Location", "Agent ID"],
            riskAreas: ["Money Mule Activity", "Cash-Out Fraud"],
            relatedPolicies: ["POL-STR-001", "POL-KYC-001"]
          },
          {
            opId: "OP-003",
            name: "FX Conversion",
            type: "Currency Exchange",
            description: "Real-time currency conversion for cross-border transactions at competitive rates.",
            dataUsed: ["Base Currency", "Target Currency", "Amount", "Exchange Rate", "Timestamp"],
            riskAreas: ["Rate Manipulation", "Regulatory Arbitrage"],
            relatedPolicies: ["POL-REC-001"]
          }
        ],
        thirdPartyIntegrations: [
          {
            name: "MyKad Verification API (JPN)",
            purpose: "Real-time verification of Malaysian national ID cards during e-KYC onboarding",
            dataShared: ["NRIC Number", "Full Name", "Date of Birth"],
            riskAreas: ["Data Privacy", "API Security"],
            relatedPolicies: ["POL-KYC-001", "POL-REC-001"]
          },
          {
            name: "World-Check (Refinitiv)",
            purpose: "PEP and sanctions screening for customer onboarding and ongoing monitoring",
            dataShared: ["Customer Name", "Date of Birth", "Nationality", "ID Number"],
            riskAreas: ["Screening Gaps", "False Negatives"],
            relatedPolicies: ["POL-KYC-001", "POL-STR-001"]
          },
          {
            name: "DuitNow (PayNet)",
            purpose: "Instant payment rails for P2P transfers and merchant payments",
            dataShared: ["Transaction Details", "Sender/Recipient IDs", "Amount"],
            riskAreas: ["Transaction Fraud", "System Availability"],
            relatedPolicies: ["POL-STR-001"]
          },
          {
            name: "Wise API",
            purpose: "Cross-border remittance corridor for international transfers",
            dataShared: ["Sender KYC", "Beneficiary Details", "Transfer Amount", "Purpose"],
            riskAreas: ["Correspondent Banking Risk", "Sanctions"],
            relatedPolicies: ["POL-KYC-001", "POL-STR-001"]
          }
        ],
        systemArchitecture: {
          frontend: "React Native mobile app with Next.js web dashboard",
          backend: "Node.js microservices on AWS EKS with Go for high-throughput transaction processing",
          databases: ["PostgreSQL (primary)", "Redis (caching)", "MongoDB (audit logs)", "Convex (real-time compliance data)"],
          infrastructure: ["AWS (ap-southeast-1)", "CloudFlare CDN", "AWS WAF", "DataDog monitoring"],
          securityControls: ["TLS 1.3 encryption", "OAuth 2.0 + PKCE", "Hardware Security Module (HSM) for key management", "PCI-DSS Level 1 compliance", "SOC 2 Type II certified"]
        },
        knownRisks: [
          "High transaction volume may exceed real-time screening capacity during peak periods",
          "Cross-border remittance to high-risk corridors requires enhanced due diligence",
          "E-KYC facial recognition may have reduced accuracy for certain demographics",
          "Agent network cash-out points present higher money mule risk",
          "DuitNow instant payments limit time for fraud detection"
        ],
        keywords: ["e-wallet", "e-money", "digital payments", "remittance", "DuitNow", "e-KYC", "AML", "CFT", "fintech", "mobile payments", "Malaysia"],
        createdAt: now,
        updatedAt: now,
        status: "submitted",
      });
      results.productSpecs = productId;
    }

    // ==========================================
    // Seed Company Policies
    // ==========================================
    if (existingPolicies) {
      results.skipped.push("companyPolicies (already exists)");
    } else {
      const policyId = await ctx.db.insert("companyPolicies", {
        companyName: "PayNet Digital Sdn Bhd",
        submissionId: "SUB-2024-PN-001",
        submittedAt: new Date().toISOString(),
        policies: [
          {
            policyId: "POL-KYC-001",
            policyName: "Customer Due Diligence (CDD) Policy",
            policyCategory: "AML/CFT",
            description: "Policy governing the identification, verification, and ongoing monitoring of customer identities to prevent money laundering and terrorism financing.",
            regulatoryCoverage: {
              regulatorReferences: ["AMLA 2001 Section 16", "BNM AML/CFT Policy Document 2024", "FATF Recommendation 10"],
              domains: ["KYC", "AML", "CTF", "RiskManagement"]
            },
            applicability: {
              appliesTo: ["All Customers", "Individual Accounts", "Corporate Accounts", "Walk-in Customers"],
              riskLevel: "High"
            },
            requirements: [
              { requirementId: "REQ-KYC-001", text: "Obtain full legal name as per NRIC/Passport for all new customers", type: "Data" },
              { requirementId: "REQ-KYC-002", text: "Verify identity documents against original or certified true copies", type: "Process" },
              { requirementId: "REQ-KYC-003", text: "Conduct e-KYC facial recognition for digital onboarding", type: "Technical" },
              { requirementId: "REQ-KYC-004", text: "Assign risk rating based on customer profile and transaction patterns", type: "Operational" }
            ],
            procedures: [
              { procedureId: "PROC-KYC-001", stepNumber: 1, text: "Collect customer identification documents (NRIC/Passport)" },
              { procedureId: "PROC-KYC-002", stepNumber: 2, text: "Perform liveness check via e-KYC platform" },
              { procedureId: "PROC-KYC-003", stepNumber: 3, text: "Validate document authenticity against MyKad/Immigration database" },
              { procedureId: "PROC-KYC-004", stepNumber: 4, text: "Screen against sanction lists and PEP databases" },
              { procedureId: "PROC-KYC-005", stepNumber: 5, text: "Calculate and assign initial risk score" },
              { procedureId: "PROC-KYC-006", stepNumber: 6, text: "Approve account or escalate to Compliance Officer" }
            ],
            dataInvolved: ["Full Name", "NRIC Number", "Date of Birth", "Residential Address", "Occupation", "Source of Funds", "Facial Biometrics"],
            relatedProducts: ["e-Wallet", "Payment Gateway", "Remittance Service"],
            relatedRisks: ["Identity Fraud", "Money Laundering", "Terrorism Financing", "PEP Exposure"],
            version: "3.2",
            lastUpdated: "2024-11-15",
            sourcePage: "Internal Policy Document Section 4"
          },
          {
            policyId: "POL-STR-001",
            policyName: "Suspicious Transaction Reporting Policy",
            policyCategory: "AML/CFT",
            description: "Policy governing the identification, documentation, and reporting of suspicious transactions to Bank Negara Malaysia.",
            regulatoryCoverage: {
              regulatorReferences: ["AMLA 2001 Section 14", "BNM STR Guidelines 2024", "FATF Recommendation 20"],
              domains: ["AML", "CTF", "Governance"]
            },
            applicability: {
              appliesTo: ["Compliance Team", "Operations Staff", "Branch Managers", "MLRO"],
              riskLevel: "High"
            },
            requirements: [
              { requirementId: "REQ-STR-001", text: "Report suspicious transactions within 24 hours of confirmation", type: "Process" },
              { requirementId: "REQ-STR-002", text: "Maintain confidentiality of STR filing - no tipping off", type: "Governance" },
              { requirementId: "REQ-STR-003", text: "Document internal investigation findings before submission", type: "Operational" },
              { requirementId: "REQ-STR-004", text: "Submit STR via BNM FINS portal with complete information", type: "Technical" }
            ],
            procedures: [
              { procedureId: "PROC-STR-001", stepNumber: 1, text: "Front-line staff identifies unusual activity and raises internal alert" },
              { procedureId: "PROC-STR-002", stepNumber: 2, text: "Compliance Officer conducts preliminary assessment" },
              { procedureId: "PROC-STR-003", stepNumber: 3, text: "Gather supporting documentation and transaction history" },
              { procedureId: "PROC-STR-004", stepNumber: 4, text: "MLRO reviews and approves STR submission" },
              { procedureId: "PROC-STR-005", stepNumber: 5, text: "Submit STR to BNM via FINS within 24 hours" },
              { procedureId: "PROC-STR-006", stepNumber: 6, text: "Archive STR and supporting documents for 6 years" }
            ],
            dataInvolved: ["Transaction Details", "Customer Profile", "Account History", "Investigation Notes", "Supporting Documents"],
            relatedProducts: ["All Financial Products"],
            relatedRisks: ["Regulatory Non-compliance", "Criminal Liability", "Reputational Damage"],
            version: "2.1",
            lastUpdated: "2024-10-20",
            sourcePage: "Internal Policy Document Section 7"
          },
          {
            policyId: "POL-REC-001",
            policyName: "Record Keeping and Retention Policy",
            policyCategory: "Compliance",
            description: "Policy governing the retention, storage, and disposal of customer records and transaction data in compliance with regulatory requirements.",
            regulatoryCoverage: {
              regulatorReferences: ["AMLA 2001 Section 17", "BNM Record Keeping Guidelines", "PDPA 2010"],
              domains: ["DataPrivacy", "Governance", "ITSecurity"]
            },
            applicability: {
              appliesTo: ["IT Department", "Compliance Team", "Operations", "All Staff"],
              riskLevel: "Medium"
            },
            requirements: [
              { requirementId: "REQ-REC-001", text: "Retain all CDD records for minimum 6 years from account closure", type: "Data" },
              { requirementId: "REQ-REC-002", text: "Store transaction records with full audit trail capability", type: "Technical" },
              { requirementId: "REQ-REC-003", text: "Ensure records are retrievable within 3 business days upon regulatory request", type: "Operational" },
              { requirementId: "REQ-REC-004", text: "Implement encryption for records containing personal data", type: "Technical" }
            ],
            procedures: [
              { procedureId: "PROC-REC-001", stepNumber: 1, text: "Classify documents based on retention category" },
              { procedureId: "PROC-REC-002", stepNumber: 2, text: "Store in designated secure repository with access controls" },
              { procedureId: "PROC-REC-003", stepNumber: 3, text: "Tag with retention period and auto-archive date" },
              { procedureId: "PROC-REC-004", stepNumber: 4, text: "Conduct quarterly audit of record integrity" },
              { procedureId: "PROC-REC-005", stepNumber: 5, text: "Securely dispose after retention period with documented approval" }
            ],
            dataInvolved: ["Customer Records", "Transaction Logs", "CDD Documents", "STR Records", "Audit Trails"],
            relatedProducts: ["All Products and Services"],
            relatedRisks: ["Data Loss", "Regulatory Breach", "Privacy Violation"],
            version: "1.5",
            lastUpdated: "2024-09-01",
            sourcePage: "Internal Policy Document Section 12"
          }
        ],
        createdAt: now,
        updatedAt: now,
        status: "submitted",
      });
      results.companyPolicies = policyId;
    }

    return {
      success: true,
      message: "Database seeded successfully!",
      ...results,
    };
  },
});

/**
 * Clear all data from the database
 * ⚠️ USE WITH CAUTION - This will delete all data!
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all regulations
    const regulations = await ctx.db.query("regulations").collect();
    for (const reg of regulations) {
      await ctx.db.delete(reg._id);
    }

    // Delete all product specs
    const productSpecs = await ctx.db.query("productSpecs").collect();
    for (const spec of productSpecs) {
      await ctx.db.delete(spec._id);
    }

    // Delete all company policies
    const policies = await ctx.db.query("companyPolicies").collect();
    for (const policy of policies) {
      await ctx.db.delete(policy._id);
    }

    // Delete all compliance analyses
    const analyses = await ctx.db.query("complianceAnalysis").collect();
    for (const analysis of analyses) {
      await ctx.db.delete(analysis._id);
    }

    // Delete all alerts
    const alerts = await ctx.db.query("alerts").collect();
    for (const alert of alerts) {
      await ctx.db.delete(alert._id);
    }

    // Delete all regulation updates
    const updates = await ctx.db.query("regulationUpdates").collect();
    for (const update of updates) {
      await ctx.db.delete(update._id);
    }

    return {
      success: true,
      message: "All data cleared!",
      deleted: {
        regulations: regulations.length,
        productSpecs: productSpecs.length,
        companyPolicies: policies.length,
        complianceAnalysis: analyses.length,
        alerts: alerts.length,
        regulationUpdates: updates.length,
      },
    };
  },
});

