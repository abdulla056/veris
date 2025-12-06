"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

// Using fetch directly to avoid bundling issues with @anthropic-ai/sdk
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Schema for the structured compliance output
const COMPLIANCE_SCHEMA_PROMPT = `You are an AI compliance expert specializing in financial regulations, particularly Anti-Money Laundering (AML) and Counter-Terrorism Financing (CFT) in Malaysia. 

Analyze the provided regulatory document text and extract key compliance information into a structured JSON format.

The output MUST be a valid JSON object matching this exact schema:

{
  "act_name": "string - Full name of the act/document",
  "jurisdiction": "Malaysia",
  "version": "string - Version or year of the document",
  "last_updated": "string - Last updated date (YYYY-MM-DD format if available)",
  "definitions": [
    {
      "term": "string - The defined term",
      "meaning": "string - Its meaning/definition",
      "source_section": "string - Section reference (e.g., Section 3)"
    }
  ],
  "obligations": [
    {
      "name": "string - Short name (e.g., Customer Due Diligence)",
      "description": "string - Detailed description",
      "applies_to": ["string array - Entities it applies to"],
      "source_section": "string - Section reference",
      "risk_level": "High | Medium | Low"
    }
  ],
  "procedures": [
    {
      "name": "string - Procedure name",
      "steps": ["string array - List of steps"],
      "conditions": "string - Prerequisites/conditions",
      "source_section": "string - Section reference"
    }
  ],
  "offences": [
    {
      "offence": "string - Offence name",
      "description": "string - Description",
      "source_section": "string - Section reference"
    }
  ],
  "penalties": [
    {
      "offence": "string - The offence",
      "fine_amount": "string - Monetary penalty",
      "imprisonment_term": "string - Imprisonment term",
      "corporate_penalty": "string - Corporate penalty",
      "source_section": "string - Section reference"
    }
  ],
  "recordkeeping_requirements": {
    "retention_period": "string - How long records must be kept",
    "conditions": "string - Specific conditions",
    "source_section": "string - Section reference"
  },
  "applicability": [
    {
      "entity_type": "string - Type of entity",
      "obligations": ["string array - Key obligations"],
      "exemptions": ["string array - Any exemptions"]
    }
  ],
  "exceptions": [
    {
      "description": "string - Exception description",
      "source_section": "string - Section reference"
    }
  ],
  "cross_references": [
    {
      "reference_type": "string - Type (Act, Guideline, Circular)",
      "related_document": "string - Document name",
      "description": "string - Relation description"
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object, no other text
- Use empty strings "" for unavailable single values
- Use empty arrays [] for unavailable list values
- Extract ALL relevant information from the document
- Focus on concrete rules, requirements, and definitions`;

export const processDocumentWithClaude = action({
  args: {
    documentText: v.string(),
    documentTitle: v.string(),
    anthropicApiKey: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
  }> => {
    const { documentText, documentTitle, anthropicApiKey } = args;

    if (!anthropicApiKey || anthropicApiKey.trim() === "") {
      return {
        success: false,
        error: "Anthropic API key is required",
      };
    }

    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          system: COMPLIANCE_SCHEMA_PROMPT,
          messages: [
            {
              role: "user",
              content: `Document Title: ${documentTitle}\n\nDocument Text:\n${documentText.slice(0, 100000)}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Anthropic API error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();

      // Extract the text content from response
      const textContent = data.content?.find((c: { type: string }) => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        return {
          success: false,
          error: "No text content in Claude response",
        };
      }

      // Parse the JSON response
      const jsonText = textContent.text.trim();
      
      // Try to extract JSON if wrapped in code blocks
      let cleanJson = jsonText;
      if (jsonText.startsWith("```")) {
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          cleanJson = match[1].trim();
        }
      }

      const parsedData = JSON.parse(cleanJson);

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Claude processing error:", errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

// Action to analyze compliance gaps between company policies and regulations
export const analyzeComplianceGaps = action({
  args: {
    companyPoliciesJson: v.string(),
    regulationJson: v.string(),
    anthropicApiKey: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    data?: {
      overallScore: number;
      status: string;
      gaps: Array<{
        gapId: string;
        category: string;
        severity: string;
        description: string;
        regulationReference: string;
        recommendation: string;
        affectedFeatures: string[];
        affectedPolicies: string[];
      }>;
      recommendations: Array<{
        priority: number;
        title: string;
        description: string;
        regulationReference: string;
        estimatedEffort?: string;
      }>;
    };
    error?: string;
  }> => {
    const { companyPoliciesJson, regulationJson, anthropicApiKey } = args;

    if (!anthropicApiKey || anthropicApiKey.trim() === "") {
      return {
        success: false,
        error: "Anthropic API key is required",
      };
    }

    const analysisPrompt = `You are a compliance analyst expert. Compare the company's policies against the regulatory requirements and identify gaps.

COMPANY POLICIES:
${companyPoliciesJson}

REGULATORY REQUIREMENTS:
${regulationJson}

Analyze and return a JSON object with:
{
  "overallScore": number (0-100, where 100 is fully compliant),
  "status": "compliant" | "partial" | "non_compliant",
  "gaps": [
    {
      "gapId": "string (unique ID like GAP-001)",
      "category": "string (obligation | procedure | recordkeeping | etc.)",
      "severity": "critical | high | medium | low",
      "description": "string (detailed description of the gap)",
      "regulationReference": "string (specific section/requirement)",
      "recommendation": "string (how to address the gap)",
      "affectedFeatures": ["string array"],
      "affectedPolicies": ["string array"]
    }
  ],
  "recommendations": [
    {
      "priority": number (1 is highest),
      "title": "string",
      "description": "string",
      "regulationReference": "string",
      "estimatedEffort": "string (optional, e.g., '2 weeks')"
    }
  ]
}

Return ONLY the JSON object.`;

    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          messages: [
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Anthropic API error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();

      const textContent = data.content?.find((c: { type: string }) => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        return {
          success: false,
          error: "No text content in Claude response",
        };
      }

      let cleanJson = textContent.text.trim();
      if (cleanJson.startsWith("```")) {
        const match = cleanJson.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          cleanJson = match[1].trim();
        }
      }

      const parsedData = JSON.parse(cleanJson);

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Compliance analysis error:", errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

