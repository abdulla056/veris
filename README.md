# Compliance Co-Pilot (MVP)

A modern, professional compliance AI dashboard for the Malaysian banking sector, designed to help compliance officers check product documents against Anti-Money Laundering (AML) regulations from Bank Negara Malaysia (BNM).

## Features

### 🎯 Dashboard Overview
- **Professional Design**: Clean white/gray theme with Trust & Safety color palette (Blues, Teals, Red/Amber alerts)
- **Inter Font**: Modern, professional typography
- **Responsive Layout**: Works seamlessly across desktop and tablet devices

### 📊 Key Components

#### 1. **Sidebar Navigation**
- Dashboard (active)
- Document Upload
- Audit Reports
- BNM Regulatory Database
- Settings
- Active state highlighting with blue accent

#### 2. **Header**
- Application title: "Compliance Co-Pilot (MVP)"
- User profile with avatar
- Role display: "Compliance Officer"
- Notification bell with unread indicator

#### 3. **Quick Audit Card**
- Prominent upload zone with dashed border
- Drag & drop functionality (UI ready)
- "Select File" and "View Sample" buttons
- Clear call-to-action for starting audits

#### 4. **Statistics Dashboard**
- **Active Audits**: Shows count of ongoing compliance checks
- **Critical Risks Found**: Red-highlighted critical issues requiring attention
- **BNM Compliance Score**: Visual progress bar showing 92% compliance with green indicator

#### 5. **Risk Cards**
- Detailed violation display
- **Detected Gap**: Clear explanation of compliance issue
- **Regulatory Citation**: Direct reference to BNM AML/CFT policy
- Severity levels: Critical, High, Medium, Low
- Color-coded borders and backgrounds
- Recommendations for remediation

#### 6. **Recent Audits Table**
- Document name with file icon
- Audit date
- Document type (Feature Spec, Policy Document)
- Status badges (Scanning, Compliant, Action Required)
- Risk level badges (High, Medium, Low)
- Interactive hover states

### 🎨 Design System

**Color Palette:**
- Primary Blue: `#2563EB` - Trust and professionalism
- Teal: `#0891B2` - Security and reliability
- Red: `#DC2626` - Critical alerts
- Amber: `#F59E0B` - Warnings
- Gray Scale: Clean, crisp backgrounds

**Typography:**
- Font Family: Inter (professional fintech standard)
- Consistent sizing and weights for hierarchy

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Component Structure

```
app/
├── page.tsx              # Main dashboard page
├── layout.tsx            # Root layout with Inter font
└── globals.css           # Global styles and theme

components/
└── dashboard/
    ├── sidebar.tsx       # Navigation sidebar
    ├── header.tsx        # Top header with user profile
    ├── quick-audit-card.tsx  # Upload zone
    ├── stat-cards.tsx    # Metric cards and compliance score
    ├── recent-audits-table.tsx  # Audit history table
    └── risk-card.tsx     # Compliance gap cards
```

## Mock Data

The dashboard includes realistic mock data for demonstration:

- **Active Audits**: 3 ongoing compliance checks
- **Critical Risks**: 1 high-priority issue
- **Sample Documents**:
  - Global Transfer Feature v2.pdf (Action Required, High Risk)
  - e-Wallet Signup Flow (Compliant, Low Risk)
  - KYC Enhancement Proposal.pdf (Scanning, Medium Risk)
  - Account Opening Policy Update (Compliant, Low Risk)

## Regulatory Compliance

The dashboard references actual Bank Negara Malaysia (BNM) regulatory frameworks:
- AML/CFT Policy Document
- Section 1, Paragraph 14.1 (Customer Identification)

## Future Enhancements

- PDF upload and parsing functionality
- AI-powered document analysis
- Real-time compliance scoring
- Integration with BNM regulatory database API
- Automated report generation
- Multi-user role management

## License

Proprietary - Malaysian Banking Sector Compliance Tool

---

Built with ❤️ for Malaysian Banking Compliance
