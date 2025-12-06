"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: "default" | "warning" | "success";
}

export function CollapsibleSection({
  title,
  subtitle,
  icon,
  badge,
  children,
  defaultOpen = true,
  variant = "default"
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantStyles = {
    default: "border-border",
    warning: "border-destructive/30 bg-destructive/5",
    success: "border-green-500/30 bg-green-500/5"
  };

  return (
    <Card className={cn("border-2", variantStyles[variant])}>
      <CardHeader>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between text-left transition-colors hover:opacity-80"
        >
          <div className="flex items-center gap-3 flex-1">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {title}
                </h3>
                {badge}
              </div>
              {subtitle && (
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

