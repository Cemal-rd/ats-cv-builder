import type { LanguageLevel, ResumeLocale } from "@/lib/schema/resume";

export interface ResumeLabels {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  certifications: string;
  projects: string;
  present: string;
  gpa: string;
  namePlaceholder: string;
  birthDate: string;
  militaryStatus: string;
  drivingLicense: string;
  languageLevels: Record<LanguageLevel, string>;
}

/** CV üzerindeki bölüm başlıkları — ATS'lerin tanıdığı standart adlar kullanılır. */
export const resumeLabels: Record<ResumeLocale, ResumeLabels> = {
  tr: {
    summary: "Profesyonel Özet",
    experience: "İş Deneyimi",
    education: "Eğitim",
    skills: "Yetenekler",
    languages: "Yabancı Diller",
    certifications: "Sertifikalar",
    projects: "Projeler",
    present: "Halen",
    gpa: "Not Ort.",
    namePlaceholder: "Ad Soyad",
    birthDate: "Doğum Tarihi",
    militaryStatus: "Askerlik",
    drivingLicense: "Ehliyet",
    languageLevels: {
      native: "Ana dil",
      c2: "C2 – Uzman",
      c1: "C1 – İleri",
      b2: "B2 – Orta üstü",
      b1: "B1 – Orta",
      a2: "A2 – Temel",
      a1: "A1 – Başlangıç",
    },
  },
  en: {
    summary: "Professional Summary",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    certifications: "Certifications",
    projects: "Projects",
    present: "Present",
    gpa: "GPA",
    namePlaceholder: "Full Name",
    birthDate: "Date of Birth",
    militaryStatus: "Military Service",
    drivingLicense: "Driving License",
    languageLevels: {
      native: "Native",
      c2: "C2 – Proficient",
      c1: "C1 – Advanced",
      b2: "B2 – Upper-Intermediate",
      b1: "B1 – Intermediate",
      a2: "A2 – Elementary",
      a1: "A1 – Beginner",
    },
  },
};

/** Editör arayüzündeki bölüm adları (CV dilinden bağımsız, Türkçe). */
export const editorSectionLabels = {
  experience: { title: "İş Deneyimi", description: "Pozisyonlar ve başarılar" },
  education: { title: "Eğitim", description: "Okul, bölüm, derece" },
  skills: { title: "Yetenekler", description: "Kategorilere göre yetkinlikler" },
  languages: { title: "Yabancı Diller", description: "Dil ve seviye (CEFR)" },
  projects: { title: "Projeler", description: "Kişisel ve açık kaynak işler" },
  certifications: { title: "Sertifikalar", description: "Lisans ve sertifikalar" },
} as const;
