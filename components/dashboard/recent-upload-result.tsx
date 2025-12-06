"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileCheck,
  CheckCircle2,
  X,
  Package,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Play,
  Link2,
} from "lucide-react";
import Link from "next/link";

interface UploadResult {
  id: string;
  documentType: "product-spec" | "compliance-policy";
  fileName: string;
  fileSize: number;
  data: Record<string, unknown>;
  alignmentAnalysis?: Record<string, unknown>;
  uploadedAt: string;
}

interface AnalysisResult {
  complianceScore: number;
  status: string;
  totalGaps: number;
  summary: {
    total_gaps: number;
    critical_gaps: number;
    high_gaps: number;
    medium_gaps: number;
    low_gaps: number;
  };
}

interface RecentUploadResultProps {
  result: UploadResult;
  onDismiss: () => void;
}

export function RecentUploadResult({ result, onDismiss }: RecentUploadResultProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const isProductSpec = result.documentType === "product-spec";

  const runAnalysis = async () => {
    if (!isProductSpec) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/compliance/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSpecId: result.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      setAnalysisResult(data.result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Compliant</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Partial</Badge>;
      case "non_compliant":
        return <Badge variant="destructive">Non-Compliant</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className={`border-2 ${isProductSpec ? 'border-primary/30 bg-primary/5' : 'border-teal-500/30 bg-teal-500/5'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isProductSpec ? 'bg-primary/20' : 'bg-teal-500/20'}`}>
              {isProductSpec ? (
                <Package className="h-5 w-5 text-primary" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Upload Successful!</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                {isProductSpec ? "Product Specification" : "Company Policy"} processed and saved
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* File Info */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            {isProductSpec ? (
              <FileText className="h-5 w-5 text-primary mt-0.5" />
            ) : (
              <FileCheck className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-foreground">{result.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {(result.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(result.uploadedAt).toLocaleTimeString()}
              </p>
            </div>
            <Badge variant="outline" className={isProductSpec ? 'border-primary/30 text-primary' : 'border-teal-500/30 text-teal-700 dark:text-teal-400'}>
              {isProductSpec ? "Product Spec" : "Policy Doc"}
            </Badge>
          </div>
        </div>

        {/* Extracted Data Summary */}
        {isProductSpec ? (
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Extracted Information</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Company:</span>
                <span className="ml-2 font-medium text-foreground">{result.data.companyName as string || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Product:</span>
                <span className="ml-2 font-medium text-foreground">{result.data.productName as string || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Features:</span>
                <span className="ml-2 font-medium text-foreground">{result.data.featuresCount as number || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Operations:</span>
                <span className="ml-2 font-medium text-foreground">{result.data.operationsCount as number || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Integrations:</span>
                <span className="ml-2 font-medium text-foreground">{result.data.integrationsCount as number || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Known Risks:</span>
                <span className="ml-2 font-medium text-foreground">{result.data.risksCount as number || 0}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Extracted Policies</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Company:</span>
                <span className="ml-2 font-medium text-foreground">{result.data.companyName as string || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Submission ID:</span>
                <span className="ml-2 font-medium text-foreground">{result.data.submissionId as string || "N/A"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Policies Found:</span>
                <span className="ml-2 font-medium text-foreground">{result.data.policiesCount as number || 0}</span>
              </div>
            </div>
            {Array.isArray(result.data.policies) && result.data.policies.length > 0 && (
              <div className="pt-2 border-t space-y-1">
                {(result.data.policies as Array<{ policyId: string; policyName: string; category: string; riskLevel: string }>).slice(0, 3).map((policy) => (
                  <div key={policy.policyId} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{policy.policyName}</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">{policy.category}</Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          policy.riskLevel?.toLowerCase() === 'high' 
                            ? 'border-red-500/30 text-red-700 dark:text-red-400' 
                            : policy.riskLevel?.toLowerCase() === 'medium'
                            ? 'border-yellow-500/30 text-yellow-700 dark:text-yellow-400'
                            : 'border-green-500/30 text-green-700 dark:text-green-400'
                        }`}
                      >
                        {policy.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(result.data.policies as Array<unknown>).length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{(result.data.policies as Array<unknown>).length - 3} more policies
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Alignment Analysis for Company Policies */}
        {!isProductSpec && result.alignmentAnalysis && (
          <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-foreground">Alignment Analysis</span>
            </div>
            {typeof result.alignmentAnalysis === 'object' && 'summary' in result.alignmentAnalysis ? (
              <p className="text-sm text-muted-foreground">
                {result.alignmentAnalysis.summary as string}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {result.alignmentAnalysis.message as string || "Analysis pending - upload product specs and regulations for comparison."}
              </p>
            )}
          </div>
        )}

        {/* Analysis Section for Product Specs */}
        {isProductSpec && !analysisResult && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Run compliance analysis to check against BNM regulations
            </p>
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              size="sm"
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        )}

        {analysisError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{analysisError}</span>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Compliance Analysis Result</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(analysisResult.complianceScore)}`}>
                  {analysisResult.complianceScore}%
                </span>
                {getStatusBadge(analysisResult.status)}
              </div>
            </div>

            {/* Gap Summary */}
            <div className="flex gap-4 text-xs">
              {analysisResult.summary.critical_gaps > 0 && (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {analysisResult.summary.critical_gaps} Critical
                </span>
              )}
              {analysisResult.summary.high_gaps > 0 && (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  {analysisResult.summary.high_gaps} High
                </span>
              )}
              {analysisResult.summary.medium_gaps > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  {analysisResult.summary.medium_gaps} Medium
                </span>
              )}
              {analysisResult.summary.low_gaps > 0 && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {analysisResult.summary.low_gaps} Low
                </span>
              )}
              {analysisResult.totalGaps === 0 && (
                <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  No gaps detected
                </span>
              )}
            </div>

            {/* Analysis Summary */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysisResult.complianceScore >= 80 ? (
                  <>
                    <span className="font-medium text-green-600 dark:text-green-400">Good compliance posture.</span>{" "}
                    The product demonstrates strong alignment with regulatory requirements. 
                    {analysisResult.totalGaps > 0 
                      ? ` However, ${analysisResult.totalGaps} minor gap${analysisResult.totalGaps > 1 ? 's were' : ' was'} identified.`
                      : " All major regulatory obligations appear to be met."}
                  </>
                ) : analysisResult.complianceScore >= 50 ? (
                  <>
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">Partial compliance detected.</span>{" "}
                    The product meets some requirements but has {analysisResult.totalGaps} compliance gap{analysisResult.totalGaps > 1 ? 's' : ''} requiring attention.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-red-600 dark:text-red-400">Significant compliance gaps identified.</span>{" "}
                    Immediate attention required to meet AML/CFT regulatory requirements.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Link to Full Reports */}
        <div className="flex justify-end pt-2">
          <Link 
            href="/reports"
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View in Audit Reports
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

