"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, FileCheck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GapAnalysisResult } from "@/lib/types/compliance";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  variant?: "default" | "warning" | "success";
}

export function StatCard({ title, value, icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "text-primary bg-primary/10",
    warning: "text-destructive bg-destructive/10",
    success: "text-green-600 dark:text-green-400 bg-green-500/10",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("rounded-full p-2", variantStyles[variant])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {trend && (
          <p className="mt-1 text-xs text-muted-foreground">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface ComplianceScoreCardProps {
  score: number;
}

export function ComplianceScoreCard({ score }: ComplianceScoreCardProps) {
  const getScoreVariant = (score: number) => {
    if (score >= 90) return { color: "green", text: "Excellent" };
    if (score >= 70) return { color: "yellow", text: "Good" };
    if (score >= 50) return { color: "orange", text: "Fair" };
    return { color: "red", text: "Critical" };
  };

  const variant = getScoreVariant(score);
  const colorClasses = {
    green: "text-green-600 dark:text-green-400 bg-green-500/10",
    yellow: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
    red: "text-destructive bg-destructive/10",
  };

  const textColorClasses = {
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    orange: "text-orange-600 dark:text-orange-400",
    red: "text-destructive",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          BNM Compliance Score
        </CardTitle>
        <div className={cn("rounded-full p-2", colorClasses[variant.color])}>
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <span className={cn("text-4xl font-bold", textColorClasses[variant.color])}>
            {score}%
          </span>
          <span className="mb-1 text-sm text-muted-foreground">{variant.text}</span>
        </div>
        <Progress value={score} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Based on AI semantic analysis
        </p>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  result: GapAnalysisResult;
}

export function StatsGrid({ result }: StatsGridProps) {
  const criticalCount = result.summary.critical_gaps + result.summary.high_gaps;
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total Gaps Detected"
        value={result.summary.total_gaps}
        icon={<FileCheck className="h-4 w-4" />}
        trend={`${result.summary.critical_gaps} critical, ${result.summary.high_gaps} high`}
        variant="default"
      />
      <StatCard
        title="Critical & High Risks"
        value={criticalCount}
        icon={<AlertCircle className="h-4 w-4" />}
        trend="Requires immediate attention"
        variant={criticalCount > 0 ? "warning" : "success"}
      />
      <ComplianceScoreCard score={result.compliance_score} />
    </div>
  );
}

