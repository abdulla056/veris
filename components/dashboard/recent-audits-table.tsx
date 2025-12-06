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
import { FileText, Clock, Trash2 } from "lucide-react";
import { useDocumentStore } from "@/lib/store/documents";
import { formatDistanceToNow } from "date-fns";

function getStatusBadge(status: "processing" | "completed" | "failed") {
  const variants = {
    processing: { className: "bg-blue-100 text-blue-800", icon: Clock },
    completed: { className: "bg-green-100 text-green-800", icon: null },
    failed: { className: "bg-red-100 text-red-800", icon: null },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={config.className}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {status === "processing" ? "Scanning" : status === "completed" ? "Compliant" : "Failed"}
    </Badge>
  );
}

function getRiskBadge(riskLevel: "high" | "medium" | "low") {
  const variants = {
    high: { className: "bg-red-100 text-red-800 border-red-200" },
    medium: { className: "bg-amber-100 text-amber-800 border-amber-200" },
    low: { className: "bg-gray-100 text-gray-800 border-gray-200" },
  };

  return (
    <Badge variant="outline" className={variants[riskLevel].className}>
      {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
    </Badge>
  );
}

export function RecentAuditsTable() {
  const { documents, removeDocument } = useDocumentStore();

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
              <TableHead>Uploaded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Risk Level</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  No documents uploaded yet. Upload a document to start an audit.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      {doc.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="text-right">
                    {getRiskBadge(doc.riskLevel)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${doc.name}"?`)) {
                          removeDocument(doc.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

