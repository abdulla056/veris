"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle } from "lucide-react";
import type { GapAnalysisResult } from "@/lib/types/compliance";

function getRiskBadge(severity: "critical" | "high" | "medium" | "low") {
  const variants = {
    critical: { className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700" },
    high: { className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700" },
    medium: { className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700" },
    low: { className: "bg-muted text-muted-foreground border-border" },
  };

  return (
    <Badge variant="outline" className={variants[severity].className}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
}

interface RecentAuditsTableProps {
  result: GapAnalysisResult;
}

export function RecentAuditsTable({ result }: RecentAuditsTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Analysis Details
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Audit ID: {result.audit_id}
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 rounded-lg border border-border bg-muted/50 p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Product</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{result.product_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Analyzed</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {new Date(result.audit_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Regulation</p>
              <p className="mt-1 text-sm font-semibold text-foreground">AMLA 2001</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Next Review</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {new Date(result.next_review_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Gaps Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Obligation</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.gaps_found.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        All obligations are compliant!
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                result.gaps_found.map((gap) => (
                  <TableRow key={gap.gap_id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {gap.regulation.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {gap.regulation.section}
                    </TableCell>
                    <TableCell>{getRiskBadge(gap.severity)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {(gap.confidence_score * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

