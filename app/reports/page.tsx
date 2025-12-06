"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProductSpecsList } from "@/components/dashboard/product-specs-list";
import { CompanyPoliciesList } from "@/components/dashboard/company-policies-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShieldCheck, FileText } from "lucide-react";

export default function AuditReportsPage() {
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
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Audit Reports</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  View and manage all uploaded documents with compliance analysis results
                </p>
              </div>
            </div>

            {/* Tabs for different document types */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all" className="gap-2">
                  <FileText className="h-4 w-4" />
                  All Documents
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                  <Package className="h-4 w-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="policies" className="gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Policies
                </TabsTrigger>
              </TabsList>

              {/* All Documents Tab */}
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ProductSpecsList />
                  <CompanyPoliciesList />
                </div>
              </TabsContent>

              {/* Products Only Tab */}
              <TabsContent value="products" className="mt-6">
                <ProductSpecsList />
              </TabsContent>

              {/* Policies Only Tab */}
              <TabsContent value="policies" className="mt-6">
                <CompanyPoliciesList />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

