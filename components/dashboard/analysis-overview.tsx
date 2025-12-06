"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  AlertCircle
} from "lucide-react";
import type { GapAnalysisResult } from "@/lib/types/compliance";
import { cn } from "@/lib/utils";

interface AnalysisOverviewProps {
  result: GapAnalysisResult;
}

export function AnalysisOverview({ result }: AnalysisOverviewProps) {
  const criticalCount = result.summary.critical_gaps;
  const highCount = result.summary.high_gaps;
  const mediumCount = result.summary.medium_gaps;
  const lowCount = result.summary.low_gaps;
  const totalGaps = result.summary.total_gaps;

  const getOverallStatus = () => {
    if (criticalCount > 0) return {
      status: "Critical",
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30"
    };
    if (highCount > 0) return {
      status: "High Risk",
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30"
    };
    if (mediumCount > 0) return {
      status: "Medium Risk",
      icon: Minus,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30"
    };
    if (lowCount > 0) return {
      status: "Low Risk",
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30"
    };
    return {
      status: "Compliant",
      icon: Shield,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/30"
    };
  };

  const statusInfo = getOverallStatus();
  const StatusIcon = statusInfo.icon;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className={cn("border-2", statusInfo.border, statusInfo.bg)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={cn("h-6 w-6", statusInfo.color)} />
              <CardTitle className="text-2xl font-bold">Analysis Overview</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Comprehensive compliance gap analysis for {result.product_name}
            </p>
          </div>
          <Badge className={cn("text-sm px-3 py-1", statusInfo.bg, statusInfo.color, "border", statusInfo.border)}>
            {statusInfo.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Compliance Score - Large Highlight */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="rounded-xl bg-card border border-border p-6 h-full flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Compliance Score
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <span className={cn("text-5xl font-bold", getScoreColor(result.compliance_score))}>
                    {result.compliance_score}
                  </span>
                  <span className="text-xl font-semibold text-muted-foreground mb-1">%</span>
                </div>
              </div>
              <Progress value={result.compliance_score} className="h-2.5" />
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="rounded-xl bg-card border border-border p-6 h-full">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Risk Distribution
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm">Critical</span>
                  </div>
                  <span className="text-sm font-bold">{criticalCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-sm">High</span>
                  </div>
                  <span className="text-sm font-bold">{highCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-sm">Medium</span>
                  </div>
                  <span className="text-sm font-bold">{mediumCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    <span className="text-sm">Low</span>
                  </div>
                  <span className="text-sm font-bold">{lowCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="rounded-xl bg-card border border-border p-6 h-full">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Analysis Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <p className="text-xs">Audit ID</p>
                  </div>
                  <p className="text-sm font-semibold font-mono">{result.audit_id}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <p className="text-xs">Analyzed</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {new Date(result.audit_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <p className="text-xs">Regulation</p>
                  </div>
                  <p className="text-sm font-semibold">BNM AMLA 2001</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <p className="text-xs">Next Review</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {new Date(result.next_review_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Recommendations */}
        {(criticalCount > 0 || highCount > 0) && (
          <div className="mt-6 rounded-lg bg-destructive/10 border border-destructive/30 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Immediate Action Required
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {criticalCount > 0 && `${criticalCount} critical ${criticalCount === 1 ? 'issue' : 'issues'}`}
                  {criticalCount > 0 && highCount > 0 && ' and '}
                  {highCount > 0 && `${highCount} high-risk ${highCount === 1 ? 'issue' : 'issues'}`}
                  {' '}detected. Review the detailed findings below and address these gaps before proceeding.
                </p>
              </div>
            </div>
          </div>
        )}

        {totalGaps === 0 && (
          <div className="mt-6 rounded-lg bg-green-500/10 border border-green-500/30 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  All Clear!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  No compliance gaps detected. Your product appears to be fully compliant with BNM AML/CFT regulations.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

