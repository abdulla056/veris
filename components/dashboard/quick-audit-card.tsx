"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export function QuickAuditCard() {
  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50/30 transition-colors hover:border-blue-400 hover:bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Audit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-blue-100 p-4">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Drag & Drop Product Spec PDF to start Audit
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            or click to browse files
          </p>
          <div className="mt-6 flex gap-2">
            <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              Select File
            </button>
            <button className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              View Sample
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

