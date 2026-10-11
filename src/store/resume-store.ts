import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSampleResume } from "@/lib/schema/factories";
import {
  parseResumeData,
  RESUME_LOCALES,
  type Resume,
  type ResumeLocale,
  type ResumeVersions,
  type TemplateId,
} from "@/lib/schema/resume";

interface ResumeState {
  /** Aktif dil sürümü — form, önizleme ve analiz bunu kullanır. */
  resume: Resume;
  /** Her dil için ayrı CV içeriği (TR ve EN sürümleri bağımsızdır). */
  versions: ResumeVersions;
  template: TemplateId;
  locale: ResumeLocale;
  jobDescription: string;
  setResume: (resume: Resume) => void;
  setTemplate: (template: TemplateId) => void;
  setLocale: (locale: ResumeLocale) => void;
  setVersions: (versions: ResumeVersions) => void;
  setJobDescription: (text: string) => void;
}

type PersistedState = Pick<ResumeState, "resume" | "versions" | "template" | "locale" | "jobDescription">;

/**
 * Uygulamanın tek doğruluk kaynağı. Form (react-hook-form) değişiklikleri
 * buraya senkronlanır; önizleme, ATS paneli ve dışa aktarma buradan okur.
 * Dil sürümü değiştirme akışı için bkz. hooks/use-switch-locale.ts.
 */
export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => {
      const sample = createSampleResume();
      return {
        resume: sample,
        versions: { tr: sample },
        template: "classic",
        locale: "tr",
        jobDescription: "",
        setResume: (resume) => set((s) => ({ resume, versions: { ...s.versions, [s.locale]: resume } })),
        setTemplate: (template) => set({ template }),
        setLocale: (locale) => set({ locale }),
        setVersions: (versions) => set({ versions }),
        setJobDescription: (jobDescription) => set({ jobDescription }),
      };
    },
    {
      name: "ats-cv-builder",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ resume, versions, template, locale, jobDescription }): PersistedState => ({
        resume,
        versions,
        template,
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
        return { ...current, ...saved, locale, resume, versions };
      },
    },
  ),
);
