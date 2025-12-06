"use client";

import { create } from "zustand";

export interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  status: "processing" | "completed" | "failed";
  riskLevel: "high" | "medium" | "low";
  size?: number;
  findings?: number;
}

interface DocumentStore {
  documents: Document[];
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  setDocuments: (documents: Document[]) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [
    {
      id: "1",
      name: "Global Transfer Feature v2.pdf",
      uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      riskLevel: "high",
      size: 2.5 * 1024 * 1024,
      findings: 3,
    },
    {
      id: "2",
      name: "e-Wallet Signup Flow.pdf",
      uploadedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      riskLevel: "low",
      size: 1.8 * 1024 * 1024,
      findings: 0,
    },
    {
      id: "3",
      name: "KYC Enhancement Proposal.pdf",
      uploadedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      status: "processing",
      riskLevel: "medium",
      size: 3.2 * 1024 * 1024,
    },
  ],
  addDocument: (document) =>
    set((state) => ({
      documents: [document, ...state.documents],
    })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),
  setDocuments: (documents) => set({ documents }),
}));

