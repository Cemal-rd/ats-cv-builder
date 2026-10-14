import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { WebAnalytics } from "@/components/analytics/web-analytics";
import { cvFontVariables } from "@/lib/fonts/cv-fonts";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });

const SITE_TITLE = "ATS Uyumlu CV Oluşturucu – Ücretsiz, Üyeliksiz";
const SITE_DESCRIPTION =
  "İşe alım sistemlerinin (ATS) okuyabildiği profesyonel CV'ni ücretsiz hazırla: canlı ATS puanı, iş ilanı eşleştirme, PDF/Word'den CV yükleme ve tek tıkla PDF. Bilgilerin cihazından çıkmaz.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // WhatsApp, LinkedIn vb. link önizlemelerinde görünen başlık ve açıklama.
  openGraph: { title: SITE_TITLE, description: SITE_DESCRIPTION, type: "website", locale: "tr_TR" },
};

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
