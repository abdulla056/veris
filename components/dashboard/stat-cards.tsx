"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, FileCheck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  variant?: "default" | "warning" | "success";
}

export function StatCard({ title, value, icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "text-blue-600 bg-blue-50",
    warning: "text-red-600 bg-red-50",
    success: "text-green-600 bg-green-50",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={cn("rounded-full p-2", variantStyles[variant])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {trend && (
          <p className="mt-1 text-xs text-gray-500">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ComplianceScoreCard() {
  const score = 92;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          BNM Compliance Score
        </CardTitle>
        <div className="rounded-full bg-green-50 p-2 text-green-600">
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-green-600">{score}%</span>
          <span className="mb-1 text-sm text-gray-500">compliant</span>
        </div>
        <Progress value={score} className="h-2" />
        <p className="text-xs text-gray-500">
          +3% from last quarter
        </p>
      </CardContent>
    </Card>
  );
}

export function StatsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Active Audits"
        value={3}
        icon={<FileCheck className="h-4 w-4" />}
        trend="2 in progress, 1 pending review"
        variant="default"
      />
      <StatCard
        title="Critical Risks Found"
        value={1}
        icon={<AlertCircle className="h-4 w-4" />}
        trend="Requires immediate attention"
        variant="warning"
      />
      <ComplianceScoreCard />
    </div>
  );
}

