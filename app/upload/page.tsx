"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { DocumentUpload } from "@/components/dashboard/document-upload";
import { RecentUploadResult } from "@/components/dashboard/recent-upload-result";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface UploadResult {
  id: string;
  documentType: "product-spec" | "compliance-policy";
  fileName: string;
  fileSize: number;
  data: Record<string, unknown>;
  alignmentAnalysis?: Record<string, unknown>;
  uploadedAt: string;
}

export default function UploadPage() {
  const [recentUpload, setRecentUpload] = useState<UploadResult | null>(null);

  const handleUploadComplete = (result: UploadResult) => {
    setRecentUpload(result);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Main Content with Scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Document Upload</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your product specifications and compliance policies for AI-powered gap analysis
                </p>
              </div>
              <Link 
                href="/reports"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all audit reports
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Document Upload Component */}
            <DocumentUpload onUploadComplete={handleUploadComplete} />

            {/* Recent Upload Result - Only shows the just-uploaded file */}
            {recentUpload && (
              <RecentUploadResult 
                result={recentUpload} 
                onDismiss={() => setRecentUpload(null)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

