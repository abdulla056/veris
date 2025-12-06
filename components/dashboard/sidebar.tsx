"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Database,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Document Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "Audit Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "BNM Regulatory Database",
    href: "/regulatory",
    icon: Database,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <ShieldCheck className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-semibold text-gray-900">
          Compliance AI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-900">BNM Compliance</p>
          <p className="text-xs text-blue-700">Last Updated: Dec 2025</p>
        </div>
      </div>
    </div>
  );
}

