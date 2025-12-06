import { SignUp } from "@clerk/nextjs";
import { LogoIcon } from "@/components/logo-icon";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <LogoIcon size="xl" showText={true} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Malaysian Fintech AML/CFT Compliance Platform
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-emerald-100 dark:border-emerald-900/30",
              primaryButton: "bg-emerald-600 hover:bg-emerald-700",
            },
          }}
        />
      </div>
    </div>
  );
}

