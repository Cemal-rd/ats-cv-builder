import type { ResumeLocale } from "@/lib/schema/resume";
import type { SectionIconKey } from "./section-icons";

export interface CustomSectionPreset {
  id: string;
  icon: SectionIconKey;
  /** CV'de görünecek başlık — ATS'lerin tanıdığı standart adlar. */
  title: Record<ResumeLocale, string>;
  description: string;
}

export const CUSTOM_SECTION_PRESETS: readonly CustomSectionPreset[] = [
  {
    id: "volunteer",
    icon: "volunteer",
    title: { tr: "Gönüllü Çalışmalar", en: "Volunteer Experience" },
    description: "Dernek, STK, topluluk",
  },
  {
    id: "publications",
    icon: "publication",
    title: { tr: "Yayınlar", en: "Publications" },
    description: "Makale, kitap, tez",
  },
  {
    id: "awards",
    icon: "award",
    title: { tr: "Ödüller ve Başarılar", en: "Honors & Awards" },
    description: "Burs, yarışma, derece",
  },
  {
    id: "talks",
    icon: "talk",
    title: { tr: "Konferanslar ve Konuşmalar", en: "Conferences & Talks" },
    description: "Sunum, panel, eğitim",
  },
  {
    id: "references",
    icon: "reference",
    title: { tr: "Referanslar", en: "References" },
    description: "Ad, unvan, iletişim",
  },
  {
    id: "interests",
    icon: "star",
    title: { tr: "Hobiler ve İlgi Alanları", en: "Interests" },
    description: "Kısa ve ilgili tutun",
  },
];
