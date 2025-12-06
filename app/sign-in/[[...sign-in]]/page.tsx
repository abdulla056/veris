import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="MyComply.ai" 
              width={220} 
              height={70}
              className="h-20 w-auto"
              priority
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Malaysian Fintech AML/CFT Compliance Platform
          </p>
        </div>
        <SignIn 
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

