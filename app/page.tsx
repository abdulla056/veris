"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { AnalysisOverview } from "@/components/dashboard/analysis-overview";
import { CollapsibleSection } from "@/components/dashboard/collapsible-section";
import { RiskCardsSection } from "@/components/dashboard/risk-card";
import { RecentAuditsTable } from "@/components/dashboard/recent-audits-table";
import type { GapAnalysisResult } from "@/lib/types/compliance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Loader2, 
  AlertTriangle, 
  FileText, 
  BarChart3,
  CheckCircle2
} from "lucide-react";

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

  const criticalAndHighCount = analysisResult 
    ? analysisResult.summary.critical_gaps + analysisResult.summary.high_gaps 
    : 0;

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
          <div className="space-y-6 p-8 max-w-[1600px] mx-auto">
            {/* Run Analysis Button */}
            <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    AI-Powered Compliance Analysis
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Run semantic analysis on mock regulatory data using Claude AI
                  </p>
                </div>
              </div>
              <Button
                onClick={runAnalysis}
                disabled={isLoading}
                size="lg"
                className="gap-2 px-6"
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
              <div className="rounded-xl border-2 border-destructive/50 bg-destructive/10 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="text-sm font-medium text-destructive">Error: {error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-12 text-center shadow-sm">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Analyzing Compliance Gaps...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Claude AI is performing semantic analysis on your regulatory documents
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    This typically takes 30-60 seconds
                  </p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {!isLoading && analysisResult && (
              <div className="space-y-6">
                {/* Overview Section - Always at Top */}
                <AnalysisOverview result={analysisResult} />

                {/* Compliance Gaps Section - Collapsible */}
                <CollapsibleSection
                  title="Compliance Gaps Detected"
                  subtitle={`${analysisResult.gaps_found.length} ${analysisResult.gaps_found.length === 1 ? 'issue' : 'issues'} requiring attention`}
                  icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
                  badge={
                    criticalAndHighCount > 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        {criticalAndHighCount} Critical/High
                      </Badge>
                    ) : analysisResult.gaps_found.length > 0 ? (
                      <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                        {analysisResult.gaps_found.length} Total
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        All Clear
                      </Badge>
                    )
                  }
                  defaultOpen={analysisResult.gaps_found.length > 0}
                  variant={criticalAndHighCount > 0 ? "warning" : analysisResult.gaps_found.length > 0 ? "default" : "success"}
                >
                  <RiskCardsSection gaps={analysisResult.gaps_found} />
                </CollapsibleSection>

                {/* Detailed Analysis Section - Collapsible */}
                <CollapsibleSection
                  title="Detailed Analysis Report"
                  subtitle="Complete breakdown of all findings and compliance metrics"
                  icon={<BarChart3 className="h-6 w-6 text-primary" />}
                  badge={
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      Full Report
                    </Badge>
                  }
                  defaultOpen={false}
                >
                  <RecentAuditsTable result={analysisResult} />
                </CollapsibleSection>

                {/* Export/Actions Section */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Need to share these results?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Export as PDF or share with your team
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      Share Report
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !analysisResult && !error && (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-16 text-center">
                <div className="mx-auto max-w-md space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Play className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Ready to Analyze
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click "Run Analysis" above to perform AI-powered compliance gap detection on your regulatory documents
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    <Badge variant="secondary" className="text-xs">
                      BNM AML/CFT
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Semantic Analysis
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Claude AI
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
