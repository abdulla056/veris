"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserButton, useUser } from "@clerk/nextjs";
import { Bell, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { LogoIcon } from "@/components/logo-icon";

export function DashboardHeader() {
  const { user } = useUser();

  // Get user initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.slice(0, 2).toUpperCase();
    }
    return "CO";
  };

  // Get user's full name
  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return "Compliance Officer";
  };

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60 px-8 shadow-sm">
      {/* Left Section - Branding */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <LogoIcon size="md" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                MyComply.ai
              </h1>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium px-2 py-0.5">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Malaysian Fintech • AML/CFT Gap Analysis
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <div className="mr-1">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <button className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
          </span>
        </button>

        {/* Divider */}
        <div className="mx-2 h-8 w-px bg-border" />

        {/* User Profile with Clerk */}
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 py-2 px-3 transition-colors hover:bg-muted">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground leading-none">{getFullName()}</p>
            <p className="text-xs text-muted-foreground mt-1">Compliance Officer</p>
          </div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-10 w-10 ring-2 ring-primary/10",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

