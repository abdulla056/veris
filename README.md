# MyComply.ai Compliance Co-Pilot (MVP)

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
- **Authentication**: Clerk
- **TypeScript**: Full type safety

## 🔐 Authentication

This app uses **Clerk** for secure authentication. All routes are protected by default.

### Quick Setup (Required):

1. **Get Clerk API Keys** (free):
   - Sign up at [https://clerk.com](https://clerk.com)
   - Create a new application
   - Copy your API keys from the dashboard

2. **Configure Environment**:
   ```bash
   # Copy the example env file
   cp .env.example .env.local
   
   # Edit .env.local and add your Clerk keys:
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_here
   ```

3. **Start the app**:
   ```bash
   npm run dev
   ```

📖 **Detailed setup instructions**: See [CLERK_SETUP.md](./CLERK_SETUP.md)

## Getting Started

```bash
# Install dependencies
npm install

# Set up Clerk authentication (see above)
cp .env.example .env.local
# Then add your Clerk keys to .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) - you'll be prompted to sign in!

## Component Structure

```
app/
├── page.tsx              # Main dashboard page (protected)
├── layout.tsx            # Root layout with Clerk provider
├── globals.css           # Global styles and theme
├── sign-in/              # Clerk sign-in page
│   └── [[...sign-in]]/
└── sign-up/              # Clerk sign-up page
    └── [[...sign-up]]/

middleware.ts             # Route protection

components/
└── dashboard/
    ├── sidebar.tsx       # Navigation sidebar
    ├── header.tsx        # Top header with Clerk user
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

## Authentication Features

✅ **Secure sign-in/sign-up** with email verification  
✅ **Protected routes** - Dashboard requires authentication  
✅ **User profile** - Real user data displayed in header  
✅ **Session management** - Secure JWT-based sessions  
✅ **Sign out** - Via UserButton dropdown  
✅ **Social logins** - Configurable in Clerk dashboard (Google, Microsoft, etc.)  

## Future Enhancements

- PDF upload and parsing functionality
- AI-powered document analysis
- Real-time compliance scoring
- Integration with BNM regulatory database API
- Automated report generation
- Role-based access control (Admin, Compliance Officer, Auditor)

## License

Proprietary - Malaysian Banking Sector Compliance Tool

---

Built with ❤️ for Malaysian Banking Compliance
