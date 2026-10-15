import type { ResumeLocale } from "@/lib/schema/resume";
import type { SectionIconKey } from "./section-icons";

export interface CustomSectionPreset {
  id: string;
  icon: SectionIconKey;
  /** CV'de görünecek başlık — ATS'lerin tanıdığı standart adlar (CV diline göre). */
  title: Record<ResumeLocale, string>;
}

/** Kısa açıklamalar arayüz dilindedir: i18n → addSection.presetDescriptions[id]. */
export const CUSTOM_SECTION_PRESETS = [
  { id: "volunteer", icon: "volunteer", title: { tr: "Gönüllü Çalışmalar", en: "Volunteer Experience" } },
  { id: "publications", icon: "publication", title: { tr: "Yayınlar", en: "Publications" } },
  { id: "awards", icon: "award", title: { tr: "Ödüller ve Başarılar", en: "Honors & Awards" } },
  { id: "talks", icon: "talk", title: { tr: "Konferanslar ve Konuşmalar", en: "Conferences & Talks" } },
  { id: "references", icon: "reference", title: { tr: "Referanslar", en: "References" } },
  { id: "interests", icon: "star", title: { tr: "Hobiler ve İlgi Alanları", en: "Interests" } },
] as const satisfies readonly CustomSectionPreset[];

export type CustomSectionPresetId = (typeof CUSTOM_SECTION_PRESETS)[number]["id"];
