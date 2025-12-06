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
  status: "uploading" | "success" | "error";
  error?: string;
  id: string;
  documentType: "product-spec" | "compliance-policy";
}

export function DocumentUpload() {
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

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress } : f
            )
          );
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, progress: 100, status: "success" }
                : f
            )
          );

          // Add to document store
          addDocument({
            id: response.file.id,
            name: file.name,
            uploadedAt: new Date().toISOString(),
            status: "processing",
            riskLevel: "medium",
            size: file.size,
          });
          
          // Auto-remove success notification after 3 seconds
          setTimeout(() => {
            setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
          }, 3000);
        } else {
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
      });

      // Handle errors
      xhr.addEventListener("error", () => {
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

      xhr.open("POST", "/api/upload");
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
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50/30">
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Quick Audit - Document Upload
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Dual Document Analysis
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600">
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
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
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
                  ? "border-teal-500 bg-teal-50 text-teal-900"
                  : "border-gray-200 bg-white text-gray-600 hover:border-teal-300"
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
                  ? "border-blue-500 bg-blue-100"
                  : "border-teal-500 bg-teal-100"
                : isDragReject
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center">
            <div className={`
              rounded-full p-4
              ${activeDocumentType === "product-spec" ? "bg-blue-100" : "bg-teal-100"}
            `}>
              <Upload className={`
                h-8 w-8
                ${activeDocumentType === "product-spec" ? "text-blue-600" : "text-teal-600"}
              `} />
            </div>
            
            {isDragActive ? (
              isDragReject ? (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-red-600">
                    Invalid file type
                  </h3>
                  <p className="mt-2 text-sm text-red-500">
                    Only PDF files are accepted
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <h3 className={`
                    text-lg font-medium
                    ${activeDocumentType === "product-spec" ? "text-blue-600" : "text-teal-600"}
                  `}>
                    Drop your {activeDocumentType === "product-spec" ? "Product Spec" : "Compliance Policy"} here
                  </h3>
                  <p className={`
                    mt-2 text-sm
                    ${activeDocumentType === "product-spec" ? "text-blue-500" : "text-teal-500"}
                  `}>
                    Release to start the audit
                  </p>
                </div>
              )
            ) : (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {activeDocumentType === "product-spec" 
                    ? "Upload Product Specification" 
                    : "Upload Current Compliance Policy"}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Drag & drop or click to browse
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PDF only • Max 10MB • Multiple files supported
                </p>
                {activeDocumentType === "product-spec" && (
                  <p className="mt-3 text-xs text-blue-600 font-medium">
                    📄 Examples: Feature specs, user flows, product designs, technical docs
                  </p>
                )}
                {activeDocumentType === "compliance-policy" && (
                  <p className="mt-3 text-xs text-teal-600 font-medium">
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
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-teal-600 hover:bg-teal-700"}
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
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  {uploadedFile.documentType === "product-spec" ? (
                    <FileText className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
                  ) : (
                    <FileCheck className="h-5 w-5 flex-shrink-0 text-teal-600 mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadedFile.file.name}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={
                            uploadedFile.documentType === "product-spec"
                              ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                              : "bg-teal-50 text-teal-700 border-teal-200 text-xs"
                          }
                        >
                          {uploadedFile.documentType === "product-spec" ? "Product Spec" : "Policy Doc"}
                        </Badge>
                      </div>
                      
                      {uploadedFile.status === "uploading" && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
                      )}
                      {uploadedFile.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                      {uploadedFile.status === "error" && (
                        <button
                          onClick={() => removeFile(uploadedFile.id)}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {uploadedFile.status === "uploading" && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Uploading {uploadedFile.progress}%
                        </Badge>
                      )}
                      {uploadedFile.status === "success" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
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

                    {uploadedFile.status === "error" && uploadedFile.error && (
                      <div className="mt-2 flex items-start gap-1 text-xs text-red-600">
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
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-1.5 flex-shrink-0">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-blue-900">How It Works:</p>
              <ol className="mt-2 space-y-1 text-blue-700 list-decimal list-inside">
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

