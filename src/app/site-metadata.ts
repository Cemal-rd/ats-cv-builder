import type { Metadata } from "next";
import type { UiLocale } from "@/i18n";

const SITE_ORIGIN = "https://cemal-rd.github.io";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const COPY: Record<UiLocale, { title: string; description: string; ogLocale: string }> = {
  tr: {
    title: "ATS Uyumlu CV Oluşturucu – Ücretsiz, Üyeliksiz",
    description:
      "İşe alım sistemlerinin (ATS) okuyabildiği profesyonel CV'ni ücretsiz hazırla: canlı ATS puanı, iş ilanı eşleştirme, PDF/Word'den CV yükleme ve tek tıkla PDF. Bilgilerin cihazından çıkmaz.",
    ogLocale: "tr_TR",
  },
  en: {
    title: "ATS-Friendly Resume Builder – Free, No Sign-up",
    description:
      "Build a professional resume that applicant tracking systems (ATS) can read: live ATS score, job description keyword matching, import from PDF/Word and one-click PDF export. Your data never leaves your device.",
    ogLocale: "en_US",
  },
};

const pagePath = (locale: UiLocale) => `${BASE_PATH}${locale === "en" ? "/en/" : "/"}`;

/** Sayfa başlığı, açıklama, link önizlemesi ve arama motorları için dil alternatifleri (hreflang). */
export function siteMetadata(locale: UiLocale): Metadata {
  const { title, description, ogLocale } = COPY[locale];
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title,
    description,
    alternates: {
      canonical: pagePath(locale),
      languages: { tr: pagePath("tr"), en: pagePath("en"), "x-default": pagePath("tr") },
    },
    // WhatsApp, LinkedIn vb. link önizlemelerinde görünen başlık ve açıklama.
    openGraph: {
      title,
      description,
      type: "website",
      url: pagePath(locale),
      locale: ogLocale,
      alternateLocale: locale === "en" ? "tr_TR" : "en_US",
      images: [{ url: `${BASE_PATH}/og-${locale}.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${BASE_PATH}/og-${locale}.png`] },
  };
}
