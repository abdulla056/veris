"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ComplianceGap } from "@/lib/types/compliance";

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
    bg: "bg-red-500/10 dark:bg-red-500/20",
    border: "border-red-500/30 dark:border-red-500/40",
    text: "text-red-900 dark:text-red-300",
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    icon: "text-red-600 dark:text-red-400",
  },
  high: {
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    border: "border-orange-500/30 dark:border-orange-500/40",
    text: "text-orange-900 dark:text-orange-300",
    badge: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
    icon: "text-orange-600 dark:text-orange-400",
  },
  medium: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    border: "border-amber-500/30 dark:border-amber-500/40",
    text: "text-amber-900 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    icon: "text-amber-600 dark:text-amber-400",
  },
  low: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-foreground",
    badge: "bg-muted text-muted-foreground border-border",
    icon: "text-muted-foreground",
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
                <p className="text-sm font-medium text-foreground mb-1">
                  Detected Gap:
                </p>
                <p className={`text-sm ${config.text}`}>
                  {detectedGap}
                </p>
              </div>
              
              {recommendation && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Recommendation:
                  </p>
                  <p className="text-sm text-foreground">
                    {recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Citation */}
          <div className="w-72 rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Regulatory Citation
            </p>
            <p className="text-sm font-medium text-foreground mb-2">
              {citation}
            </p>
            {citationLink && (
              <a
                href={citationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
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

interface RiskCardsSectionProps {
  gaps: ComplianceGap[];
}

export function RiskCardsSection({ gaps }: RiskCardsSectionProps) {
  if (gaps.length === 0) {
    return (
      <div className="rounded-xl border-2 border-green-500/30 bg-green-500/5 p-8 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <AlertTriangle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              No Compliance Gaps Detected
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              All obligations are properly addressed. Your product appears to be fully compliant with BNM AML/CFT regulations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {gaps.map((gap, index) => (
        <div key={gap.gap_id}>
          <RiskCard
            title={gap.regulation.name}
            detectedGap={gap.gap_description}
            citation={gap.citation}
            citationLink={undefined}
            severity={gap.severity}
            recommendation={gap.recommendation}
          />
        </div>
      ))}
    </div>
  );
}

