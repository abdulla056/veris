"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { DocumentUpload } from "@/components/dashboard/document-upload";

export default function UploadPage() {
  return (
    <div className="flex h-screen bg-gray-50">
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Upload</h1>
              <p className="mt-1 text-sm text-gray-500">
                Upload your product specifications and compliance policies for AI-powered gap analysis
              </p>
            </div>

            {/* Document Upload Component */}
            <DocumentUpload />
          </div>
        </main>
      </div>
    </div>
  );
}

