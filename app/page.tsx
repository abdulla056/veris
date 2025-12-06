"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatsGrid } from "@/components/dashboard/stat-cards";
import { RecentAuditsTable } from "@/components/dashboard/recent-audits-table";
import { RiskCardsSection } from "@/components/dashboard/risk-card";
import type { GapAnalysisResult } from "@/lib/types/compliance";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-mock', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result: GapAnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Run Analysis Button */}
            <div className="flex items-center justify-between rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  AI-Powered Compliance Analysis
                </h2>
                <p className="text-sm text-gray-600">
                  Run semantic analysis on mock regulatory data using Claude AI
                </p>
              </div>
              <Button
                onClick={runAnalysis}
                disabled={isLoading}
                size="lg"
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">Error: {error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Analyzing Compliance Gaps...
                  </h3>
                  <p className="text-sm text-gray-600">
                    Claude AI is performing semantic analysis on your regulatory documents
                  </p>
                  <p className="text-xs text-gray-500">
                    This typically takes 30-60 seconds
                  </p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {!isLoading && analysisResult && (
              <>
                {/* Stats Grid */}
                <StatsGrid result={analysisResult} />

                {/* Risk Cards Section */}
                <RiskCardsSection gaps={analysisResult.gaps_found} />

                {/* Recent Audits Table */}
                <RecentAuditsTable result={analysisResult} />
              </>
            )}

            {/* Empty State */}
            {!isLoading && !analysisResult && !error && (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <Play className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No Analysis Yet
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Click "Run Analysis" to perform AI-powered compliance gap detection
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
