"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDocumentStore } from "@/lib/store/documents";

interface UploadedFile {
  file: File;
  progress: number;
  status: "uploading" | "processing" | "success" | "error";
  error?: string;
  id: string;
  documentType: "product-spec" | "compliance-policy";
}

export interface UploadResult {
  id: string;
  documentType: "product-spec" | "compliance-policy";
  fileName: string;
  fileSize: number;
  data: Record<string, unknown>;
  alignmentAnalysis?: Record<string, unknown>;
  uploadedAt: string;
}

interface DocumentUploadProps {
  onUploadComplete?: (result: UploadResult) => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeDocumentType, setActiveDocumentType] = useState<"product-spec" | "compliance-policy">("product-spec");
  const { addDocument } = useDocumentStore();

  const uploadFile = async (file: File, documentType: "product-spec" | "compliance-policy") => {
    const fileId = Math.random().toString(36).substring(7);
    
    // Add file to state with uploading status
    setUploadedFiles((prev) => [
      ...prev,
      {
        file,
        progress: 0,
        status: "uploading",
        id: fileId,
        documentType,
      },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const xhr = new XMLHttpRequest();

      // Track upload progress (upload is 50%, processing is the other 50%)
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 50); // Cap at 50% for upload
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress, status: "uploading" } : f
            )
          );
        }
      });

      // When upload completes, show processing status and animate progress
      xhr.upload.addEventListener("load", () => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 55, status: "processing" } : f
          )
        );
        
        // Simulate gradual progress during AI processing (55% -> 90%)
        let simulatedProgress = 55;
        const progressInterval = setInterval(() => {
          simulatedProgress += Math.random() * 5 + 2; // Random increment between 2-7%
          if (simulatedProgress >= 90) {
            simulatedProgress = 90;
            clearInterval(progressInterval);
          }
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId && f.status === "processing"
                ? { ...f, progress: Math.round(simulatedProgress) }
                : f
            )
          );
        }, 800); // Update every 800ms
        
        // Store interval ID for cleanup
        (xhr as any).__progressInterval = progressInterval;
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        // Clear progress simulation interval
        if ((xhr as any).__progressInterval) {
          clearInterval((xhr as any).__progressInterval);
        }
        
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { 
                    ...f, 
                    progress: 100, 
                    status: "success",
                    convexFileId: response.productSpecId || response.companyPolicyId,
                    extractedData: response.data,
                  }
                : f
            )
          );

          // Add to document store
          addDocument({
            id: response.productSpecId || response.companyPolicyId || fileId,
            name: file.name,
            uploadedAt: new Date().toISOString(),
            status: "completed",
            riskLevel: response.data?.risksCount > 3 ? "high" : "medium",
            size: file.size,
          });
          
          // Call the onUploadComplete callback with the result
          if (onUploadComplete) {
            onUploadComplete({
              id: response.productSpecId || response.companyPolicyId || fileId,
              documentType: documentType,
              fileName: file.name,
              fileSize: file.size,
              data: response.data || {},
              alignmentAnalysis: response.alignmentAnalysis,
              uploadedAt: new Date().toISOString(),
            });
          }
          
          // Auto-remove success notification after 5 seconds
          setTimeout(() => {
            setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
          }, 5000);
        } else {
          let errorMessage = "Upload failed. Please try again.";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorMessage;
          } catch {
            // Use default error
          }
          
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "error",
                    error: errorMessage,
                  }
                : f
            )
          );
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        // Clear progress simulation interval
        if ((xhr as any).__progressInterval) {
          clearInterval((xhr as any).__progressInterval);
        }
        
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error",
                  error: "Network error. Please check your connection.",
                }
              : f
          )
        );
      });

      // Use the upload-and-process endpoint for PDF to JSON conversion
      xhr.open("POST", "/api/upload-and-process");
      xhr.send(formData);
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                error: "Upload failed. Please try again.",
              }
            : f
        )
      );
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadFile(file, activeDocumentType);
    });
  }, [activeDocumentType]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Quick Audit - Document Upload
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Dual Document Analysis
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Upload <strong>two documents</strong> for comprehensive compliance gap detection:
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveDocumentType("product-spec")}
            className={`
              flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all
              ${
                activeDocumentType === "product-spec"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }
            `}
          >
            <FileText className="h-6 w-6" />
            <div className="text-center">
              <p className="text-sm font-semibold">Product Specification</p>
              <p className="text-xs mt-1">Feature specs, user flows, designs</p>
            </div>
          </button>

          <button
            onClick={() => setActiveDocumentType("compliance-policy")}
            className={`
              flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all
              ${
                activeDocumentType === "compliance-policy"
                  ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-400"
                  : "border-border bg-card text-muted-foreground hover:border-teal-500/50"
              }
            `}
          >
            <FileCheck className="h-6 w-6" />
            <div className="text-center">
              <p className="text-sm font-semibold">Compliance Policy</p>
              <p className="text-xs mt-1">Current AML/CFT, KYC policies</p>
            </div>
          </button>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`
            cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all
            ${
              isDragActive && !isDragReject
                ? activeDocumentType === "product-spec"
                  ? "border-primary bg-primary/20"
                  : "border-teal-500 bg-teal-500/20"
                : isDragReject
                ? "border-destructive bg-destructive/10"
                : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center">
            <div className={`
              rounded-full p-4
              ${activeDocumentType === "product-spec" ? "bg-primary/20" : "bg-teal-500/20"}
            `}>
              <Upload className={`
                h-8 w-8
                ${activeDocumentType === "product-spec" ? "text-primary" : "text-teal-600 dark:text-teal-400"}
              `} />
            </div>
            
            {isDragActive ? (
              isDragReject ? (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-destructive">
                    Invalid file type
                  </h3>
                  <p className="mt-2 text-sm text-destructive/80">
                    Only PDF files are accepted
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <h3 className={`
                    text-lg font-medium
                    ${activeDocumentType === "product-spec" ? "text-primary" : "text-teal-600 dark:text-teal-400"}
                  `}>
                    Drop your {activeDocumentType === "product-spec" ? "Product Spec" : "Compliance Policy"} here
                  </h3>
                  <p className={`
                    mt-2 text-sm
                    ${activeDocumentType === "product-spec" ? "text-primary/80" : "text-teal-600/80 dark:text-teal-400/80"}
                  `}>
                    Release to start the audit
                  </p>
                </div>
              )
            ) : (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-foreground">
                  {activeDocumentType === "product-spec" 
                    ? "Upload Product Specification" 
                    : "Upload Current Compliance Policy"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag & drop or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF only • Max 10MB • Multiple files supported
                </p>
                {activeDocumentType === "product-spec" && (
                  <p className="mt-3 text-xs text-primary font-medium">
                    📄 Examples: Feature specs, user flows, product designs, technical docs
                  </p>
                )}
                {activeDocumentType === "compliance-policy" && (
                  <p className="mt-3 text-xs text-teal-600 dark:text-teal-400 font-medium">
                    📋 Examples: Internal AML policy, KYC guidelines, transaction monitoring framework
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                className={`
                  rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors
                  ${activeDocumentType === "product-spec" 
                    ? "bg-primary hover:bg-primary/90" 
                    : "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"}
                `}
              >
                Select {activeDocumentType === "product-spec" ? "Product Spec" : "Policy Document"}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  {uploadedFile.documentType === "product-spec" ? (
                    <FileText className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  ) : (
                    <FileCheck className="h-5 w-5 flex-shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {uploadedFile.file.name}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={
                            uploadedFile.documentType === "product-spec"
                              ? "bg-primary/10 text-primary border-primary/30 text-xs"
                              : "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30 text-xs"
                          }
                        >
                          {uploadedFile.documentType === "product-spec" ? "Product Spec" : "Policy Doc"}
                        </Badge>
                      </div>
                      
                      {(uploadedFile.status === "uploading" || uploadedFile.status === "processing") && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                      )}
                      {uploadedFile.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                      {uploadedFile.status === "error" && (
                        <button
                          onClick={() => removeFile(uploadedFile.id)}
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {uploadedFile.status === "uploading" && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Uploading {uploadedFile.progress}%
                        </Badge>
                      )}
                      {uploadedFile.status === "processing" && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 animate-pulse">
                          🔄 Processing with AI...
                        </Badge>
                      )}
                      {uploadedFile.status === "success" && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          ✓ Ready for Analysis
                        </Badge>
                      )}
                      {uploadedFile.status === "error" && (
                        <Badge variant="destructive">
                          Failed
                        </Badge>
                      )}
                    </div>

                    {uploadedFile.status === "uploading" && (
                      <Progress value={uploadedFile.progress} className="mt-2 h-1" />
                    )}

                    {uploadedFile.status === "processing" && (
                      <div className="mt-2 space-y-2">
                        <Progress value={uploadedFile.progress} className="h-1" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Please wait while we parse and analyze your document. This may take a moment...
                        </p>
                      </div>
                    )}

                    {uploadedFile.status === "error" && uploadedFile.error && (
                      <div className="mt-2 flex items-start gap-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{uploadedFile.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Information Banner */}
        <div className="rounded-lg bg-primary/10 border border-primary/30 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/20 p-1.5 flex-shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-foreground">How It Works:</p>
              <ol className="mt-2 space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Upload your <strong>Product Specification</strong> (new feature or product design)</li>
                <li>Upload your <strong>Current Compliance Policy</strong> (internal AML/CFT guidelines)</li>
                <li>Our AI compares both against <strong>BNM regulations</strong></li>
                <li>Get precise <strong>gap detection</strong> with legal citations in minutes</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

