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
    critical: { className: "bg-red-100 text-red-800 border-red-200" },
    high: { className: "bg-orange-100 text-orange-800 border-orange-200" },
    medium: { className: "bg-amber-100 text-amber-800 border-amber-200" },
    low: { className: "bg-gray-100 text-gray-800 border-gray-200" },
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
            <CardTitle className="text-lg font-semibold text-gray-900">
              Analysis Details
            </CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Audit ID: {result.audit_id}
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Product</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{result.product_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Analyzed</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {new Date(result.audit_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Regulation</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">AMLA 2001</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Next Review</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
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
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <p className="text-sm font-medium text-green-800">
                        All obligations are compliant!
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                result.gaps_found.map((gap) => (
                  <TableRow key={gap.gap_id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {gap.regulation.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
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

