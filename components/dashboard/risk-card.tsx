"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RiskCardProps {
  title: string;
  detectedGap: string;
  citation: string;
  citationLink?: string;
  severity: "critical" | "high" | "medium" | "low";
  recommendation?: string;
}

const severityConfig = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    badge: "bg-red-100 text-red-800 border-red-200",
    icon: "text-red-600",
  },
  high: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-900",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "text-orange-600",
  },
  medium: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "text-amber-600",
  },
  low: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-900",
    badge: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "text-gray-600",
  },
};

export function RiskCard({
  title,
  detectedGap,
  citation,
  citationLink,
  severity,
  recommendation,
}: RiskCardProps) {
  const config = severityConfig[severity];

  return (
    <Card className={`border-2 ${config.border} ${config.bg}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Left Side - Detected Gap */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className={`h-5 w-5 ${config.icon}`} />
              <Badge variant="outline" className={config.badge}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)} Risk
              </Badge>
            </div>
            
            <h3 className={`text-lg font-semibold ${config.text} mb-2`}>
              {title}
            </h3>
            
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Detected Gap:
                </p>
                <p className={`text-sm ${config.text}`}>
                  {detectedGap}
                </p>
              </div>
              
              {recommendation && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Recommendation:
                  </p>
                  <p className="text-sm text-gray-700">
                    {recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Citation */}
          <div className="w-72 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Regulatory Citation
            </p>
            <p className="text-sm font-medium text-gray-900 mb-2">
              {citation}
            </p>
            {citationLink && (
              <a
                href={citationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View Full Document
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskCardsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Detected Compliance Gaps
          </h2>
          <p className="text-sm text-gray-500">
            Issues requiring immediate attention
          </p>
        </div>
      </div>

      <RiskCard
        title="Anonymous Transfer Allowed"
        detectedGap="The Global Transfer Feature v2 specification allows transactions without proper customer identification verification for amounts below RM 10,000. This creates a vulnerability for potential money laundering activities."
        citation="Bank Negara Malaysia AML/CFT Policy Document, Section 1, Paragraph 14.1"
        citationLink="https://www.bnm.gov.my/aml-cft"
        severity="critical"
        recommendation="Implement mandatory KYC verification for all transfer amounts. Add transaction monitoring alerts for patterns that may indicate structuring."
      />
    </div>
  );
}

