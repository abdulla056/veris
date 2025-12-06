import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { QuickAuditCard } from "@/components/dashboard/quick-audit-card";
import { StatsGrid } from "@/components/dashboard/stat-cards";
import { RecentAuditsTable } from "@/components/dashboard/recent-audits-table";
import { RiskCardsSection } from "@/components/dashboard/risk-card";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Main Content with Scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Quick Audit Upload Zone */}
            <QuickAuditCard />

            {/* Stats Grid */}
            <StatsGrid />

            {/* Risk Cards Section */}
            <RiskCardsSection />

            {/* Recent Audits Table */}
            <RecentAuditsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
