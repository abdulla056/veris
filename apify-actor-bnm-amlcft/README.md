# Bank Negara Malaysia AML/CFT Compliance Scraper

An Apify actor that scrapes Bank Negara Malaysia's (BNM) Anti-Money Laundering and Counter Financing of Terrorism (AML/CFT) regulatory documents, downloads PDF files, and extracts compliance policies for fintech companies.

## Features

- 🔍 **Automated Web Scraping**: Crawls BNM's AML/CFT pages to find all regulatory documents
- 📄 **PDF Download & Processing**: Downloads and processes PDF documents automatically
- 📊 **Text Extraction**: Extracts full text content from PDFs using `pdf-parse`
- 🏷️ **Compliance Categorization**: Automatically categorizes content into compliance areas:
  - AML (Anti-Money Laundering)
  - CFT (Counter Financing of Terrorism)
  - KYC (Know Your Customer)
  - CDD (Customer Due Diligence)
  - STR (Suspicious Transaction Reporting)
  - RBA (Risk-Based Approach)
  - SANCTIONS (Sanctions Compliance)
  - PEP (Politically Exposed Persons)
  - RECORD_KEEPING
  - TRAINING
  - GOVERNANCE
- ⚡ **Importance Assessment**: Rates compliance sections by importance (high/medium/low)
- 📚 **Regulatory Reference Extraction**: Identifies regulatory references and citations
- 📈 **Comprehensive Reporting**: Generates detailed scraping statistics and compliance summaries

## Input Configuration

```json
{
  "startUrls": [
    { "url": "https://www.bnm.gov.my/amlcft" }
  ],
  "maxPdfsToDownload": 0,
  "extractFullText": true,
  "followLinks": true,
  "maxCrawlDepth": 2,
  "pdfKeywords": []
}
```

### Input Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `startUrls` | Array | BNM AML/CFT page | List of URLs to start scraping from |
| `maxPdfsToDownload` | Integer | 0 (unlimited) | Maximum number of PDFs to download |
| `extractFullText` | Boolean | true | Whether to extract full text from PDFs |
| `followLinks` | Boolean | true | Whether to follow links to sub-pages |
| `maxCrawlDepth` | Integer | 2 | Maximum depth of links to follow |
| `pdfKeywords` | Array | [] | Filter PDFs by keywords in URL/link text |

## Output

### Dataset Output

Each PDF document is saved to the dataset with the following structure:

```typescript
{
  id: string;                    // Unique document identifier
  filename: string;              // Original PDF filename
  sourceUrl: string;             // URL where PDF was downloaded from
  foundOnPage: string;           // Page where the PDF link was found
  linkText: string;              // Text of the download link
  title: string;                 // Document title
  fileSize: number;              // File size in bytes
  scrapedAt: string;             // ISO timestamp of scraping
  lastModified: string;          // Last modified date from server
  pageCount: number;             // Number of pages in PDF
  fullText: string;              // Extracted text content
  complianceSections: [{
    title: string;               // Section title
    content: string;             // Section content
    category: string;            // Compliance category
    importance: string;          // high/medium/low
    references: string[];        // Regulatory references
  }];
  metadata: {
    author: string;
    creator: string;
    producer: string;
    creationDate: string;
    modificationDate: string;
    keywords: string;
    subject: string;
  };
  status: string;                // success/partial/failed
  error?: string;                // Error message if failed
}
```

### Key-Value Store Output

- `SCRAPING_STATS` - Scraping statistics
- `FINAL_REPORT` - Comprehensive final report with compliance summary
- `PDF_{id}` - Raw PDF files (binary)
- `OUTPUT` - Actor output summary

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
cd apify-actor-bnm-amlcft

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally
npm start
```

### Running with Apify CLI

```bash
# Install Apify CLI
npm install -g apify-cli

# Login to Apify
apify login

# Run the actor locally
apify run

# Push to Apify platform
apify push
```

## Usage Example

### Basic Usage

```javascript
import Apify from 'apify';

const run = await Apify.call('your-username/bnm-amlcft-scraper', {
  startUrls: [{ url: 'https://www.bnm.gov.my/amlcft' }],
  maxPdfsToDownload: 10,
  extractFullText: true,
});

console.log('Scraping results:', run.output);
```

### Filtering by Keywords

```javascript
const run = await Apify.call('your-username/bnm-amlcft-scraper', {
  pdfKeywords: ['guideline', 'circular', 'policy'],
  maxCrawlDepth: 3,
});
```

## Integration with Veris Platform

This actor is designed to work with the Veris AI Compliance Analysis platform:

1. **Schedule Regular Runs**: Set up scheduled runs to check for new regulatory documents
2. **Webhook Integration**: Configure webhooks to notify the platform when new documents are found
3. **API Access**: Use the Apify API to fetch results programmatically
4. **Dataset Export**: Export datasets in JSON/CSV format for analysis

### Example Integration Code

```typescript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: 'YOUR_APIFY_TOKEN',
});

// Run the actor
const run = await client.actor('your-username/bnm-amlcft-scraper').call({
  maxPdfsToDownload: 50,
});

// Get results
const { items } = await client.dataset(run.defaultDatasetId).listItems();

// Process compliance documents
for (const doc of items) {
  await processComplianceDocument(doc);
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Apify Actor                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   main.ts   │───▶│  scraper.ts │───▶│pdf-extractor│     │
│  │  (Entry)    │    │  (Crawler)  │    │    .ts      │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    types.ts                          │   │
│  │              (Type Definitions)                      │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      Outputs                                │
│  ┌───────────┐  ┌───────────┐  ┌───────────────────────┐   │
│  │  Dataset  │  │Key-Value  │  │     Final Report      │   │
│  │  (JSON)   │  │  Store    │  │  (Stats + Summary)    │   │
│  └───────────┘  └───────────┘  └───────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Compliance Categories

The actor automatically categorizes content into these compliance areas:

| Category | Description |
|----------|-------------|
| AML | Anti-Money Laundering provisions |
| CFT | Counter Financing of Terrorism |
| KYC | Know Your Customer requirements |
| CDD | Customer Due Diligence |
| STR | Suspicious Transaction Reporting |
| RBA | Risk-Based Approach |
| SANCTIONS | Targeted Financial Sanctions |
| PEP | Politically Exposed Persons |
| RECORD_KEEPING | Record Retention Requirements |
| TRAINING | Staff Training Requirements |
| GOVERNANCE | Internal Controls & Governance |

## License

MIT License - See LICENSE file for details.

## Support

For issues or feature requests, please create an issue in the repository or contact the Veris team.

