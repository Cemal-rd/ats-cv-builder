import { Carlito, EB_Garamond, Lato, Lora, Merriweather, Open_Sans, Roboto, Source_Sans_3 } from "next/font/google";
import type { CvFontId } from "@/lib/schema/resume";

/*
 * CV yazı tipleri siteye gömülür (self-hosted): her cihazda ve PDF'te aynı görünür,
 * Türkçe karakterler için latin-ext alt kümesi yüklenir. preload kapalı — dosya
 * yalnızca o yazı tipi seçildiğinde indirilir.
 * Not: next/font seçenekleri derleme zamanında analiz edildiği için literal yazılmalıdır.
 */

const carlito = Carlito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-cv-carlito",
});
const roboto = Roboto({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-cv-roboto",
});
const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-cv-open-sans",
});
const lato = Lato({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-cv-lato",
});
const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-cv-source-sans",
});
const merriweather = Merriweather({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-cv-merriweather",
});
const lora = Lora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-cv-lora",
});
const garamond = EB_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-cv-garamond",
});

/** <body> üzerine eklenecek CSS değişken sınıfları. */
export const cvFontVariables = [carlito, roboto, openSans, lato, sourceSans, merriweather, lora, garamond]
  .map((font) => font.variable)
  .join(" ");

export type CvFontCategory = "default" | "sans" | "serif";

export interface CvFontDefinition {
  label: string;
  category: CvFontCategory;
  /** null → şablonun kendi yazı tipi. */
  stack: string | null;
}

export const CV_FONTS: Record<CvFontId, CvFontDefinition> = {
  template: { label: "Şablon varsayılanı", category: "default", stack: null },
  arial: { label: "Arial", category: "sans", stack: 'Arial, Helvetica, "Liberation Sans", sans-serif' },
  calibri: { label: "Calibri (Carlito)", category: "sans", stack: "Calibri, var(--font-cv-carlito), Arial, sans-serif" },
  inter: { label: "Inter", category: "sans", stack: "var(--font-sans), Arial, sans-serif" },
  roboto: { label: "Roboto", category: "sans", stack: "var(--font-cv-roboto), Arial, sans-serif" },
  "open-sans": { label: "Open Sans", category: "sans", stack: "var(--font-cv-open-sans), Arial, sans-serif" },
  lato: { label: "Lato", category: "sans", stack: "var(--font-cv-lato), Arial, sans-serif" },
  "source-sans": { label: "Source Sans", category: "sans", stack: "var(--font-cv-source-sans), Arial, sans-serif" },
  georgia: { label: "Georgia", category: "serif", stack: 'Georgia, "Times New Roman", serif' },
  times: { label: "Times New Roman", category: "serif", stack: '"Times New Roman", Times, "Liberation Serif", serif' },
  merriweather: { label: "Merriweather", category: "serif", stack: "var(--font-cv-merriweather), Georgia, serif" },
  lora: { label: "Lora", category: "serif", stack: "var(--font-cv-lora), Georgia, serif" },
  garamond: { label: "EB Garamond", category: "serif", stack: "var(--font-cv-garamond), Georgia, serif" },
};

export function getCvFontStack(id: CvFontId): string | undefined {
  return (CV_FONTS[id] ?? CV_FONTS.template).stack ?? undefined;
}
