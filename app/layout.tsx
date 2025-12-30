import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "co-read",
  description: "A shared literary space.",
};

export const viewport = {
  themeColor: "#f7f5f2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { LanguageProvider } from "@/contexts/language-context";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ConfirmDialogProvider } from "@/components/ConfirmDialog";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <LanguageProvider>
          <ConfirmDialogProvider>
            <LanguageToggle />
            <main className="min-h-screen pb-16 md:pb-0">
              {children}
            </main>
          </ConfirmDialogProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
