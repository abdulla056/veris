import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function LogoIcon({ className, size = "md", showText = true }: LogoIconProps) {
  const sizeClasses = {
    sm: { icon: "h-8 w-8", text: "text-lg" },
    md: { icon: "h-10 w-10", text: "text-xl" },
    lg: { icon: "h-12 w-12", text: "text-2xl" },
    xl: { icon: "h-16 w-16", text: "text-3xl" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Shield Icon with Checkmark */}
      <div className="relative">
        <svg
          viewBox="0 0 64 64"
          className={cn(currentSize.icon, "drop-shadow-md")}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle */}
          <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" className="text-emerald-600 dark:text-emerald-500" />
          
          {/* Shield background */}
          <path
            d="M32 8C20 8 16 12 16 12v16c0 12 8 20 16 24 8-4 16-12 16-24V12s-4-4-16-4z"
            fill="currentColor"
            className="text-emerald-600 dark:text-emerald-500"
          />
          
          {/* Shield circuit pattern overlay */}
          <path
            d="M28 20h2v2h-2zm6 0h2v2h-2zm-6 4h2v2h-2zm6 0h2v2h-2z"
            fill="currentColor"
            className="text-emerald-800/30 dark:text-emerald-300/20"
          />
          
          {/* Checkmark */}
          <path
            d="M26 32l4 4 8-8"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow"
          />
          
          {/* Decorative hibiscus accent (top right) */}
          <circle cx="44" cy="18" r="3.5" fill="currentColor" className="text-emerald-400 dark:text-emerald-300" />
          <circle cx="44" cy="18" r="2" fill="white" />
        </svg>
      </div>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold leading-none text-foreground", currentSize.text)}>
            MyComply.ai
          </span>
        </div>
      )}
    </div>
  );
}
