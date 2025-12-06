"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
  FileText,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  Package,
  Trash2,
} from "lucide-react";

interface ProductSpec {
  _id: string;
  companyName: string;
  productName: string;
  productVersion: string;
  industryCategory: string;
  status: string;
  submittedAt: string;
  features: Array<unknown>;
  knownRisks: string[];
}

interface AnalysisResult {
  success: boolean;
  analysisId: string;
  auditId: string;
  result: {
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
  };
}

export function ProductSpecsList() {
  const [productSpecs, setProductSpecs] = useState<ProductSpec[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [specToDelete, setSpecToDelete] = useState<ProductSpec | null>(null);

  // Fetch product specs on mount
  useEffect(() => {
    fetchProductSpecs();
  }, []);

  const fetchProductSpecs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/upload-and-process");
      if (response.ok) {
        const data = await response.json();
        setProductSpecs(data.productSpecs || []);
      }
    } catch (err) {
      setError("Failed to load product specs");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async (productSpecId: string) => {
    setAnalyzingId(productSpecId);
    setError(null);

    try {
      const response = await fetch("/api/compliance/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSpecId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResults((prev) => ({ ...prev, [productSpecId]: result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDeleteClick = (spec: ProductSpec) => {
    setSpecToDelete(spec);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!specToDelete) return;

    const response = await fetch(`/api/product-specs?id=${specToDelete._id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete");
    }

    // Remove from local state
    setProductSpecs((prev) => prev.filter((s) => s._id !== specToDelete._id));
    // Remove any analysis results
    setAnalysisResults((prev) => {
      const newResults = { ...prev };
      delete newResults[specToDelete._id];
      return newResults;
    });
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading product specs...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Product Specifications</CardTitle>
              <p className="text-sm text-muted-foreground">
                {productSpecs.length} {productSpecs.length === 1 ? "product" : "products"} uploaded
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchProductSpecs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          </div>
        )}

        {productSpecs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No product specs uploaded yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a PDF to get started with compliance analysis
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {productSpecs.map((spec) => {
              const result = analysisResults[spec._id];
              const isAnalyzing = analyzingId === spec._id;

              return (
                <div
                  key={spec._id}
                  className="rounded-lg border bg-card p-4 transition-all hover:border-primary/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground truncate">
                          {spec.productName}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          v{spec.productVersion}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">
                          {spec.companyName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {spec.industryCategory}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {spec.features?.length || 0} features
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {spec.knownRisks?.length || 0} risks
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {result ? (
                        <>
                          <div className="text-right">
                            <span className={`text-2xl font-bold ${getScoreColor(result.result.complianceScore)}`}>
                              {result.result.complianceScore}%
                            </span>
                            <div className="mt-1">
                              {getStatusBadge(result.result.status)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <AlertTriangle className="h-3 w-3" />
                              {result.result.totalGaps} gaps
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteClick(spec)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => runAnalysis(spec._id)}
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
                                Analyze
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteClick(spec)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {result && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {/* Gap Summary */}
                      <div className="flex gap-4 text-xs">
                        {result.result.summary.critical_gaps > 0 && (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {result.result.summary.critical_gaps} Critical
                          </span>
                        )}
                        {result.result.summary.high_gaps > 0 && (
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            {result.result.summary.high_gaps} High
                          </span>
                        )}
                        {result.result.summary.medium_gaps > 0 && (
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                            {result.result.summary.medium_gaps} Medium
                          </span>
                        )}
                        {result.result.summary.low_gaps > 0 && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {result.result.summary.low_gaps} Low
                          </span>
                        )}
                        {result.result.totalGaps === 0 && (
                          <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            No gaps detected
                          </span>
                        )}
                      </div>

                      {/* Analysis Summary Paragraph */}
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {result.result.complianceScore >= 80 ? (
                            <>
                              <span className="font-medium text-green-600 dark:text-green-400">Good compliance posture.</span>{" "}
                              {spec.productName} demonstrates strong alignment with regulatory requirements. 
                              {result.result.totalGaps > 0 
                                ? ` However, ${result.result.totalGaps} minor gap${result.result.totalGaps > 1 ? 's were' : ' was'} identified that should be addressed to achieve full compliance.`
                                : " All major regulatory obligations appear to be met."}
                            </>
                          ) : result.result.complianceScore >= 50 ? (
                            <>
                              <span className="font-medium text-yellow-600 dark:text-yellow-400">Partial compliance detected.</span>{" "}
                              {spec.productName} meets some regulatory requirements but has {result.result.totalGaps} compliance gap{result.result.totalGaps > 1 ? 's' : ''} requiring attention.
                              {result.result.summary.critical_gaps > 0 || result.result.summary.high_gaps > 0
                                ? ` Priority should be given to addressing the ${result.result.summary.critical_gaps + result.result.summary.high_gaps} critical/high severity issue${result.result.summary.critical_gaps + result.result.summary.high_gaps > 1 ? 's' : ''}.`
                                : " Review and remediate identified gaps to improve compliance score."}
                            </>
                          ) : (
                            <>
                              <span className="font-medium text-red-600 dark:text-red-400">Significant compliance gaps identified.</span>{" "}
                              {spec.productName} requires immediate attention to meet AML/CFT regulatory requirements. 
                              {result.result.totalGaps} gap{result.result.totalGaps > 1 ? 's were' : ' was'} found
                              {result.result.summary.critical_gaps > 0 
                                ? `, including ${result.result.summary.critical_gaps} critical issue${result.result.summary.critical_gaps > 1 ? 's' : ''} that must be resolved urgently.`
                                : ". A comprehensive remediation plan is recommended."}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Product Specification"
        description="You are about to permanently delete this product specification and all associated compliance data."
        itemName={specToDelete?.productName || ""}
        itemType="product-spec"
        warningMessage="This will permanently delete the product specification, including all features, operations, integrations, and any associated compliance analysis results. This action cannot be undone."
      />
    </Card>
  );
}

