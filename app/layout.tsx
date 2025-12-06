import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compliance Co-Pilot | Malaysian Banking AML Dashboard",
  description: "AI-powered compliance dashboard for Malaysian banking sector AML/CFT regulation checks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} font-sans antialiased`}
        >
          <ThemeProvider
            defaultTheme="light"
            storageKey="veris-theme"
        >
          {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
