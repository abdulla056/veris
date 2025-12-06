"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
  FileCheck,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Building2,
  ShieldCheck,
  Link2,
  ArrowRight,
  Trash2,
} from "lucide-react";

interface Policy {
  policyId: string;
  policyName: string;
  policyCategory: string;
  description: string;
  regulatoryCoverage: {
    regulatorReferences: string[];
    domains: string[];
  };
  applicability: {
    appliesTo: string[];
    riskLevel: string;
  };
  requirements: Array<{ requirementId: string; text: string; type: string }>;
  procedures: Array<{ procedureId: string; stepNumber: number; text: string }>;
  dataInvolved: string[];
  relatedProducts: string[];
  relatedRisks: string[];
  version: string;
  lastUpdated: string;
  sourcePage: string;
}

interface CompanyPolicy {
  _id: string;
  companyName: string;
  submissionId: string;
  submittedAt: string;
  policies: Policy[];
  status: string;
}

interface AlignmentResult {
  alignmentScore: number;
  status: string;
  productPolicyAlignments: Array<{
    productFeature: string;
    productFeatureId: string;
    alignedPolicy: string;
    alignedPolicyId: string;
    alignmentStrength: string;
    gaps: string[];
    recommendations: string[];
  }>;
  regulatoryAlignments: Array<{
    companyPolicy: string;
    companyPolicyId: string;
    regulationName: string;
    regulationSection: string;
    alignmentStrength: string;
    gaps: string[];
    citations: string[];
  }>;
  criticalGaps: Array<{
    area: string;
    description: string;
    regulatoryRequirement: string;
    severity: string;
    recommendation: string;
  }>;
  summary: string;
}

export function CompanyPoliciesList() {
  const [companyPolicies, setCompanyPolicies] = useState<CompanyPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<CompanyPolicy | null>(null);

  // Fetch company policies on mount
  useEffect(() => {
    fetchCompanyPolicies();
  }, []);

  const fetchCompanyPolicies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/company-policies");
      if (response.ok) {
        const data = await response.json();
        setCompanyPolicies(data.companyPolicies || []);
      }
    } catch (err) {
      setError("Failed to load company policies");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (policy: CompanyPolicy, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expand/collapse
    setPolicyToDelete(policy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!policyToDelete) return;

    const response = await fetch(`/api/company-policies?id=${policyToDelete._id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete");
    }

    // Remove from local state
    setCompanyPolicies((prev) => prev.filter((p) => p._id !== policyToDelete._id));
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs">Medium Risk</Badge>;
      case "low":
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs">Low Risk</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{riskLevel}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "aml/cft":
        return <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400">{category}</Badge>;
      case "compliance":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">{category}</Badge>;
      case "risk management":
        return <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400">{category}</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-teal-500/30">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span className="ml-3 text-muted-foreground">Loading company policies...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-teal-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
              <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Company Policies</CardTitle>
              <p className="text-sm text-muted-foreground">
                {companyPolicies.length} {companyPolicies.length === 1 ? "document" : "documents"} uploaded
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCompanyPolicies}>
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

        {companyPolicies.length === 0 ? (
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No company policies uploaded yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your internal AML/CFT policies to check alignment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {companyPolicies.map((doc) => {
              const isExpanded = expandedPolicy === doc._id;
              
              return (
                <div
                  key={doc._id}
                  className="rounded-lg border bg-card transition-all hover:border-teal-500/50"
                >
                  {/* Header */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedPolicy(isExpanded ? null : doc._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <h4 className="font-medium text-foreground truncate">
                            {doc.companyName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Submission ID: {doc.submissionId}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {new Date(doc.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs border-teal-500/30 text-teal-700 dark:text-teal-400">
                            {doc.policies.length} {doc.policies.length === 1 ? "Policy" : "Policies"}
                          </Badge>
                          {/* Show domains covered */}
                          {doc.policies.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {[...new Set(doc.policies.flatMap(p => p.regulatoryCoverage.domains))].slice(0, 3).join(", ")}
                              {[...new Set(doc.policies.flatMap(p => p.regulatoryCoverage.domains))].length > 3 && "..."}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDeleteClick(doc, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ArrowRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content - Policy Details */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4">
                      <div className="pt-4 space-y-3">
                        {doc.policies.map((policy) => (
                          <div
                            key={policy.policyId}
                            className="rounded-lg bg-muted/50 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm text-foreground">
                                    {policy.policyName}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {policy.policyId}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {policy.description}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {getCategoryBadge(policy.policyCategory)}
                                {getRiskLevelBadge(policy.applicability.riskLevel)}
                              </div>
                            </div>

                            {/* Policy Details */}
                            <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-muted-foreground">Requirements:</span>
                                <span className="ml-1 font-medium">{policy.requirements.length}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Procedures:</span>
                                <span className="ml-1 font-medium">{policy.procedures.length}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Regulatory References:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {policy.regulatoryCoverage.regulatorReferences.slice(0, 3).map((ref, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {ref}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Domains:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {policy.regulatoryCoverage.domains.map((domain, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {domain}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Related Risks */}
                            {policy.relatedRisks.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border/50">
                                <span className="text-xs text-muted-foreground">Risk Areas:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {policy.relatedRisks.map((risk, i) => (
                                    <Badge key={i} variant="outline" className="text-xs border-red-500/30 text-red-700 dark:text-red-400">
                                      {risk}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Alignment Analysis Summary */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Link2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-medium text-foreground">Alignment Status</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            This company policy document contains {doc.policies.length} internal {doc.policies.length === 1 ? "policy" : "policies"} covering {" "}
                            <span className="font-medium text-foreground">
                              {[...new Set(doc.policies.flatMap(p => p.regulatoryCoverage.domains))].join(", ")}
                            </span>{" "}
                            domains. The policies reference key regulatory frameworks including{" "}
                            <span className="font-medium text-foreground">
                              {[...new Set(doc.policies.flatMap(p => p.regulatoryCoverage.regulatorReferences))].slice(0, 3).join(", ")}
                            </span>.
                            {doc.policies.some(p => p.applicability.riskLevel.toLowerCase() === 'high') && (
                              <> <span className="text-red-600 dark:text-red-400 font-medium">
                                {doc.policies.filter(p => p.applicability.riskLevel.toLowerCase() === 'high').length} high-risk {doc.policies.filter(p => p.applicability.riskLevel.toLowerCase() === 'high').length === 1 ? "policy requires" : "policies require"} careful monitoring.
                              </span></>
                            )}
                          </p>
                        </div>
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
        title="Delete Company Policy Document"
        description="You are about to permanently delete this company policy document and all associated data."
        itemName={policyToDelete?.companyName || ""}
        itemType="company-policy"
        warningMessage="This will permanently delete all policies in this document, including requirements, procedures, and regulatory mappings. Any compliance analyses referencing these policies may be affected. This action cannot be undone."
      />
    </Card>
  );
}

