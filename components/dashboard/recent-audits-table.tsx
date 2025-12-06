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
import { FileText, Clock } from "lucide-react";

interface AuditData {
  id: string;
  documentName: string;
  date: string;
  type: string;
  status: "Scanning" | "Compliant" | "Action Required";
  riskLevel: "High" | "Medium" | "Low";
}

const auditData: AuditData[] = [
  {
    id: "1",
    documentName: "Global Transfer Feature v2.pdf",
    date: "Dec 5, 2025",
    type: "Feature Spec",
    status: "Action Required",
    riskLevel: "High",
  },
  {
    id: "2",
    documentName: "e-Wallet Signup Flow",
    date: "Dec 4, 2025",
    type: "Policy Document",
    status: "Compliant",
    riskLevel: "Low",
  },
  {
    id: "3",
    documentName: "KYC Enhancement Proposal.pdf",
    date: "Dec 3, 2025",
    type: "Feature Spec",
    status: "Scanning",
    riskLevel: "Medium",
  },
  {
    id: "4",
    documentName: "Account Opening Policy Update",
    date: "Dec 2, 2025",
    type: "Policy Document",
    status: "Compliant",
    riskLevel: "Low",
  },
];

function getStatusBadge(status: AuditData["status"]) {
  const variants: Record<
    AuditData["status"],
    { variant: "default" | "secondary" | "destructive"; className?: string }
  > = {
    Scanning: { variant: "secondary", className: "bg-blue-100 text-blue-800" },
    Compliant: { variant: "secondary", className: "bg-green-100 text-green-800" },
    "Action Required": { variant: "destructive" },
  };

  return (
    <Badge variant={variants[status].variant} className={variants[status].className}>
      {status === "Scanning" && <Clock className="mr-1 h-3 w-3" />}
      {status}
    </Badge>
  );
}

function getRiskBadge(riskLevel: AuditData["riskLevel"]) {
  const variants: Record<
    AuditData["riskLevel"],
    { className: string }
  > = {
    High: { className: "bg-red-100 text-red-800 border-red-200" },
    Medium: { className: "bg-amber-100 text-amber-800 border-amber-200" },
    Low: { className: "bg-gray-100 text-gray-800 border-gray-200" },
  };

  return (
    <Badge variant="outline" className={variants[riskLevel].className}>
      {riskLevel}
    </Badge>
  );
}

export function RecentAuditsTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Audits
            </CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Track your document compliance checks
            </p>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Document Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Risk Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditData.map((audit) => (
              <TableRow key={audit.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    {audit.documentName}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{audit.date}</TableCell>
                <TableCell className="text-gray-600">{audit.type}</TableCell>
                <TableCell>{getStatusBadge(audit.status)}</TableCell>
                <TableCell className="text-right">
                  {getRiskBadge(audit.riskLevel)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

