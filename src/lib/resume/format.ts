import { hasText } from "@/lib/utils";
import type { PersonalInfo, Resume } from "@/lib/schema/resume";
import type { ResumeLabels } from "./labels";

/**
 * Madde işareti öneki. -: Word'ün Symbol/Wingdings madde işaretleri
 * (PDF'ten içe aktarılan CV'lerde görünmez karakter olarak gelir).
 */
const BULLET_PREFIX = /^\s*(?:[-–—•*▪▫●○◦·■□➢➤►▶▸‣⁃∙✓✔❖◆◇★➔→-]|\d+[.)]\s)\s*/u;
/** Özel kullanım alanı karakterleri: çıktıda kutu (□) olarak görünür, ATS'ler okuyamaz. */
const PRIVATE_USE = /[-]/gu;

/** Emoji ve emoji birleştiricileri (ZWJ, varyasyon seçicisi). */
export const EMOJI_PATTERN = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu;

/**
 * Çok satırlı açıklamayı madde listesine çevirir; kullanıcının yazdığı "-" / "•" öneklerini
 * temizler. Yalnızca işaretten oluşan satırlar (boş madde) atlanır.
 */
export function toBullets(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(PRIVATE_USE, " ").replace(BULLET_PREFIX, "").replace(BULLET_PREFIX, "").trim())
    .filter((line) => /[\p{L}\p{N}]/u.test(line));
}

/** "React, Next.js; Git" → ["React", "Next.js", "Git"] */
export function splitList(text: string): string[] {
  return text
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatDateRange(start: string, end: string, current: boolean, presentLabel: string): string {
  const from = start.trim();
  const to = current ? presentLabel : end.trim();
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

export function displayUrl(url: string): string {
  return url.trim().replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

/**
 * Kullanıcının yazdığı adresi tıklanabilir bağlantıya çevirir ("github.com/x" → "https://github.com/x").
 * http(s) dışındaki şemalar (ör. "javascript:") da "https://" önekiyle etkisiz kalır.
 */
export function toHref(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export interface ContactItem {
  text: string;
  /** Varsa CV'de tıklanabilir bağlantı olur (PDF'te de çalışır). */
  href?: string;
}

export function getContactItems(personal: PersonalInfo): ContactItem[] {
  const items: ContactItem[] = [];
  const email = personal.email.trim();
  const phone = personal.phone.trim();
  const location = personal.location.trim();

  if (email) items.push({ text: email, href: `mailto:${email}` });
  if (phone) items.push({ text: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` });
  if (location) items.push({ text: location });
  for (const url of [personal.linkedin, personal.website]) {
    if (url.trim()) items.push({ text: displayUrl(url), href: toHref(url) });
  }
  return items;
}

/** Türkiye'ye özel opsiyonel alanlar: "Doğum Tarihi: … | Askerlik: … | Ehliyet: B" */
export function getPersonalDetails(personal: PersonalInfo, labels: ResumeLabels): string[] {
  return [
    [labels.birthDate, personal.birthDate],
    [labels.militaryStatus, personal.militaryStatus],
    [labels.drivingLicense, personal.drivingLicense],
  ]
    .filter(([, value]) => value.trim())
    .map(([label, value]) => `${label}: ${value.trim()}`);
}

export function getPhoto(personal: PersonalInfo): string | null {
  return personal.showPhoto && personal.photo ? personal.photo : null;
}

export function joinNonEmpty(values: string[], separator: string): string {
  return values.map((v) => v.trim()).filter(Boolean).join(separator);
}

/** Şablonların yalnızca dolu kayıtları göstermesi için filtrelenmiş görünüm. */
export function selectFilledSections(resume: Resume) {
  return {
    summary: resume.summary.trim(),
    experience: resume.experience.filter((e) => hasText(e.position, e.company, e.description)),
    education: resume.education.filter((e) => hasText(e.institution, e.degree, e.field)),
    skills: resume.skills.filter((s) => hasText(s.items)),
    languages: resume.languages.filter((l) => hasText(l.name)),
    certifications: resume.certifications.filter((c) => hasText(c.name)),
    projects: resume.projects.filter((p) => hasText(p.name, p.description)),
    customSections: resume.customSections
      .map((section) => ({
        ...section,
        entries: section.entries.filter((e) => hasText(e.title, e.subtitle, e.description)),
      }))
      .filter((section) => hasText(section.title) && section.entries.length > 0),
  };
}

export type FilledSections = ReturnType<typeof selectFilledSections>;

/** Anahtar kelime eşleştirme ve kelime sayımı için CV'nin düz metin hali. */
export function resumeToPlainText(resume: Resume): string {
  const { personal } = resume;
  const parts: string[] = [
    personal.fullName,
    personal.title,
    personal.location,
    resume.summary,
    ...resume.experience.flatMap((e) => [e.position, e.company, e.location, e.description]),
    ...resume.education.flatMap((e) => [e.institution, e.degree, e.field, e.description]),
    ...resume.skills.flatMap((s) => [s.category, s.items]),
    ...resume.languages.map((l) => l.name),
    ...resume.certifications.flatMap((c) => [c.name, c.issuer]),
    ...resume.projects.flatMap((p) => [p.name, p.role, p.description]),
    ...resume.customSections.flatMap((s) => [
      s.title,
      ...s.entries.flatMap((e) => [e.title, e.subtitle, e.description]),
    ]),
  ];
  return parts.filter((p) => p.trim()).join("\n");
}

/**
 * Çıktı (önizleme/PDF) için tüm metin alanlarından emojileri temizler.
 * Fotoğraf data URL'ine dokunulmaz.
 */
export function sanitizeResumeForOutput(resume: Resume): Resume {
  const clean = (value: unknown, key?: string): unknown => {
    if (typeof value === "string") {
      if (key === "photo") return value;
      return value
        .replace(EMOJI_PATTERN, "")
        .replace(PRIVATE_USE, "")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/^[ \t]+|[ \t]+$/gm, "");
    }
    if (Array.isArray(value)) return value.map((item) => clean(item));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v, k)]));
    }
    return value;
  };
  return clean(resume) as Resume;
}

export function buildFileName(fullName: string): string {
  const base = fullName.trim().replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_-]/gu, "");
  return base ? `${base}_CV` : "CV";
}
