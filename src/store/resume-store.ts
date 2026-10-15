import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { detectUiLocaleFromPath } from "@/i18n";
import { createSampleResumeFor } from "@/lib/schema/factories";
import {
  CV_FONT_IDS,
  DEFAULT_HEADER_LAYOUT,
  headerLayoutSchema,
  type HeaderLayout,
  parseResumeData,
  RESUME_LOCALES,
  type Resume,
  type ResumeLocale,
  type CvFontId,
  type ResumeVersions,
  type TemplateId,
} from "@/lib/schema/resume";

interface ResumeState {
  /** Aktif dil sürümü — form, önizleme ve analiz bunu kullanır. */
  resume: Resume;
  /** Her dil için ayrı CV içeriği (TR ve EN sürümleri bağımsızdır). */
  versions: ResumeVersions;
  template: TemplateId;
  font: CvFontId;
  header: HeaderLayout;
  locale: ResumeLocale;
  jobDescription: string;
  setResume: (resume: Resume) => void;
  setTemplate: (template: TemplateId) => void;
  setFont: (font: CvFontId) => void;
  setHeader: (patch: Partial<HeaderLayout>) => void;
  setLocale: (locale: ResumeLocale) => void;
  setVersions: (versions: ResumeVersions) => void;
  setJobDescription: (text: string) => void;
}

type PersistedState = Pick<ResumeState, "resume" | "versions" | "template" | "font" | "header" | "locale" | "jobDescription">;

/**
 * Uygulamanın tek doğruluk kaynağı. Form (react-hook-form) değişiklikleri
 * buraya senkronlanır; önizleme, ATS paneli ve dışa aktarma buradan okur.
 * Dil sürümü değiştirme akışı için bkz. hooks/use-switch-locale.ts.
 */
export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => {
      // İlk ziyaret: İngilizce sayfada John Doe (İngilizce CV), Türkçe sayfada Ali Veli.
      const initialLocale: ResumeLocale = detectUiLocaleFromPath();
      const sample = createSampleResumeFor(initialLocale);
      return {
        resume: sample,
        versions: { [initialLocale]: sample },
        template: "classic",
        font: "template",
        header: DEFAULT_HEADER_LAYOUT,
        locale: initialLocale,
        jobDescription: "",
        setResume: (resume) => set((s) => ({ resume, versions: { ...s.versions, [s.locale]: resume } })),
        setTemplate: (template) => set({ template }),
        setFont: (font) => set({ font }),
        setHeader: (patch) => set((s) => ({ header: { ...s.header, ...patch } })),
        setLocale: (locale) => set({ locale }),
        setVersions: (versions) => set({ versions }),
        setJobDescription: (jobDescription) => set({ jobDescription }),
      };
    },
    {
      name: "ats-cv-builder",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ resume, versions, template, font, header, locale, jobDescription }): PersistedState => ({
        resume,
        versions,
        template,
        font,
        header,
        locale,
        jobDescription,
      }),
      // Eski / bozuk kayıtları normalize et; eksik alanlar varsayılanla doldurulur.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PersistedState>;
        const locale = RESUME_LOCALES.includes(saved.locale as ResumeLocale) ? (saved.locale as ResumeLocale) : current.locale;
        const resume = parseResumeData(saved.resume) ?? current.resume;
        const versions: ResumeVersions = {};
        for (const key of RESUME_LOCALES) {
          const version = parseResumeData(saved.versions?.[key]);
          if (version) versions[key] = version;
        }
        versions[locale] = resume;
        const font = CV_FONT_IDS.includes(saved.font as CvFontId) ? (saved.font as CvFontId) : current.font;
        const header = headerLayoutSchema.safeParse(saved.header).data ?? current.header;
        return { ...current, ...saved, font, header, locale, resume, versions };
      },
    },
  ),
);
