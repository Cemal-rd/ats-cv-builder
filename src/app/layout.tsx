import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { WebAnalytics } from "@/components/analytics/web-analytics";
import { cvFontVariables } from "@/lib/fonts/cv-fonts";
import "./globals.css";
import { siteMetadata } from "./site-metadata";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });

// Varsayılan (Türkçe); /en/ sayfası kendi metadata'sıyla bunu ezer.
export const metadata = siteMetadata("tr");

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} ${cvFontVariables} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
          <WebAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
