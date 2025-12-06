# Compliance Co-Pilot - Product Concept

## What it is
The **Compliance Co-Pilot** is an AI-powered auditing platform designed specifically for Malaysian Financial Institutions. It acts as an automated "legal associate" that reviews internal banking products and policies to ensure they comply with Bank Negara Malaysia (BNM) regulations, specifically focusing on Anti-Money Laundering (AML) laws.

## What it does (Key Features)

### Automated Document Auditing
Users (Compliance Officers) can drag and drop PDF documents—such as new feature specifications, user flows, or internal policy drafts—directly into the dashboard.

### Regulatory Cross-Referencing
The system utilizes a specialized "Source of Truth" database that is constantly updated by a web scraper monitoring `bnm.gov.my`. It compares the uploaded bank documents against the latest BNM AML/CFT Policy Documents.

### Risk Detection & Citation
Instead of a simple "Pass/Fail," the AI identifies specific gaps (e.g., "Transaction limit exceeds threshold without e-KYC") and provides precise citations to the specific paragraph in the law that is being violated.

### Static Analysis
It analyzes the design of a product before it goes live, helping banks catch compliance issues early in the development cycle to avoid hefty fines and delays.

## Target Audience

- **Compliance Officers** at Fintechs and Banks in Malaysia.
- **Product Managers** launching new financial features.

## The "Magic" (Under the Hood)
It uses a **RAG (Retrieval-Augmented Generation)** architecture. When a document is uploaded, the AI doesn't just guess; it retrieves the exact legal clauses from the Bank Negara database to validate its findings, providing an audit trail that lawyers can trust.

