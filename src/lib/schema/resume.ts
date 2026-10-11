import { z } from "zod";
import { createId } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Sabitler                                                                   */
/* -------------------------------------------------------------------------- */

export const TEMPLATE_IDS = ["classic", "modern"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const RESUME_LOCALES = ["tr", "en"] as const;
export type ResumeLocale = (typeof RESUME_LOCALES)[number];

/** CV yazı tipleri — kayıt (etiket, CSS yığını) için bkz. lib/fonts/cv-fonts.ts. */
export const CV_FONT_IDS = [
  "template",
  "arial",
  "calibri",
  "inter",
  "roboto",
  "open-sans",
  "lato",
  "source-sans",
  "georgia",
  "times",
  "merriweather",
  "lora",
  "garamond",
] as const;
export type CvFontId = (typeof CV_FONT_IDS)[number];

/** CEFR seviyeleri + ana dil. */
export const LANGUAGE_LEVELS = ["native", "c2", "c1", "b2", "b1", "a2", "a1"] as const;
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

/** Sürükle-bırak ile sıralanabilen yerleşik bölümler (Kişisel bilgiler ve Özet her zaman en üsttedir). */
export const BUILTIN_SECTIONS = ["experience", "education", "skills", "languages", "projects", "certifications"] as const;
export type BuiltinSectionKey = (typeof BUILTIN_SECTIONS)[number];

/* -------------------------------------------------------------------------- */
/*  Paylaşılan kurallar                                                        */
/* -------------------------------------------------------------------------- */

const LINK_PATTERN = /^(https?:\/\/)?([\p{L}\p{N}-]+\.)+\p{L}{2,}(\/\S*)?$/iu;
const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;

/**
 * Karakter sınırları — form doğrulaması ve CV içe aktarma aynı değerleri kullanır.
 * Gerçek CV'lerdeki uzun unvan/proje/okul adlarına yetecek kadar geniş tutulur;
 * amaç yalnızca yanlışlıkla yapıştırılan dev metinleri ve bozuk verileri engellemektir.
 */
export const LIMITS = {
  /** Not ortalaması, telefon */
  tiny: 20,
  date: 40,
  languageName: 40,
  /** Yetenek kategorisi, özel bölüm başlığı, askerlik durumu */
  label: 80,
  fullName: 100,
  /** Pozisyon, şirket, okul, bölüm, derece, konum, unvan, proje adı/rolü, sertifika kurumu */
  text: 150,
  /** Sertifika adı, özel kayıt başlığı/alt başlığı */
  longTitle: 200,
  skillItems: 1000,
  summary: 2000,
  educationDescription: 2000,
  projectDescription: 3000,
  customDescription: 3000,
  experienceDescription: 5000,
} as const;

const id = z.string().min(1);
const shortText = (max: number = LIMITS.text) => z.string().trim().max(max, `En fazla ${max} karakter`);
const longText = (max: number) => z.string().max(max, `En fazla ${max} karakter`);
const dateText = shortText(LIMITS.date);
const optionalLink = z
  .string()
  .trim()
  .regex(LINK_PATTERN, "Geçerli bir bağlantı girin (ör. linkedin.com/in/adiniz)")
  .or(z.literal(""));

/* -------------------------------------------------------------------------- */
/*  Bölüm şemaları (form doğrulaması için)                                     */
/* -------------------------------------------------------------------------- */

export const personalInfoSchema = z.object({
  fullName: shortText(LIMITS.fullName),
  title: shortText(LIMITS.text),
  email: z.string().trim().email("Geçerli bir e-posta adresi girin").or(z.literal("")),
  phone: z.string().trim().regex(PHONE_PATTERN, "Geçerli bir telefon numarası girin").or(z.literal("")),
  location: shortText(LIMITS.text),
  linkedin: optionalLink,
  website: optionalLink,
  /** Küçültülmüş JPEG data URL'i. */
  photo: z.string(),
  showPhoto: z.boolean(),
  /* Türkiye'ye özel, opsiyonel alanlar */
  birthDate: shortText(LIMITS.date),
  militaryStatus: shortText(LIMITS.label),
  drivingLicense: shortText(LIMITS.date),
});

export const experienceSchema = z.object({
  id,
  position: shortText(),
  company: shortText(),
  location: shortText(),
  startDate: dateText,
  endDate: dateText,
  current: z.boolean(),
  /** Her satır bir madde (bullet point) olarak işlenir. */
  description: longText(LIMITS.experienceDescription),
});

export const educationSchema = z.object({
  id,
  institution: shortText(),
  degree: shortText(),
  field: shortText(),
  location: shortText(),
  startDate: dateText,
  endDate: dateText,
  gpa: shortText(LIMITS.tiny),
  description: longText(LIMITS.educationDescription),
});

export const skillGroupSchema = z.object({
  id,
  category: shortText(LIMITS.label),
  /** Virgülle ayrılmış yetenek listesi. */
  items: longText(LIMITS.skillItems),
});

export const languageSchema = z.object({
  id,
  name: shortText(LIMITS.languageName),
  level: z.enum(LANGUAGE_LEVELS),
});

export const certificationSchema = z.object({
  id,
  name: shortText(LIMITS.longTitle),
  issuer: shortText(),
  date: dateText,
  url: optionalLink,
});

export const projectSchema = z.object({
  id,
  name: shortText(),
  role: shortText(),
  url: optionalLink,
  startDate: dateText,
  endDate: dateText,
  description: longText(LIMITS.projectDescription),
});

export const customEntrySchema = z.object({
  id,
  title: shortText(LIMITS.longTitle),
  subtitle: shortText(LIMITS.longTitle),
  date: dateText,
  description: longText(LIMITS.customDescription),
});

export const customSectionSchema = z.object({
  id,
  title: shortText(LIMITS.label),
  /** Yalnızca editörde gösterilen simge anahtarı; CV çıktısına girmez. */
  icon: z.string().max(30),
  entries: z.array(customEntrySchema).max(30),
});

export const resumeSchema = z.object({
  personal: personalInfoSchema,
  summary: longText(LIMITS.summary),
  experience: z.array(experienceSchema).max(30),
  education: z.array(educationSchema).max(10),
  skills: z.array(skillGroupSchema).max(20),
  languages: z.array(languageSchema).max(20),
  certifications: z.array(certificationSchema).max(40),
  projects: z.array(projectSchema).max(30),
  customSections: z.array(customSectionSchema).max(15),
  /** Yerleşik bölüm anahtarları ve "custom:<id>" değerleri. */
  sectionOrder: z.array(z.string()),
});

/* -------------------------------------------------------------------------- */
/*  Yapısal şema (içe aktarma / localStorage hidrasyonu için)                  */
/*  İçerik kurallarını uygulamaz ve eksik alanları varsayılanla doldurur:      */
/*  eski sürümden kalan kayıtlar ve hatalı e-posta içeren yedekler de          */
/*  yüklenebilir, hatalar formda gösterilir.                                   */
/* -------------------------------------------------------------------------- */

const text = z.string().catch("").default("");
const flag = z.boolean().catch(false).default(false);
const itemId = z.string().min(1).catch(() => createId()).default(() => createId());
const list = <T extends z.ZodTypeAny>(schema: T) => z.array(schema).catch([]).default([]);
const item = <T extends z.ZodRawShape>(shape: T) => z.object({ id: itemId, ...shape });

export const resumeDataSchema = z.object({
  personal: z
    .object({
      fullName: text,
      title: text,
      email: text,
      phone: text,
      location: text,
      linkedin: text,
      website: text,
      photo: text,
      showPhoto: flag,
      birthDate: text,
      militaryStatus: text,
      drivingLicense: text,
    }),
  summary: text,
  experience: list(
    item({ position: text, company: text, location: text, startDate: text, endDate: text, current: flag, description: text }),
  ),
  education: list(
    item({ institution: text, degree: text, field: text, location: text, startDate: text, endDate: text, gpa: text, description: text }),
  ),
  skills: list(item({ category: text, items: text })),
  languages: list(item({ name: text, level: z.enum(LANGUAGE_LEVELS).catch("b1").default("b1") })),
  certifications: list(item({ name: text, issuer: text, date: text, url: text })),
  projects: list(item({ name: text, role: text, url: text, startDate: text, endDate: text, description: text })),
  customSections: list(item({ title: text, icon: text, entries: list(item({ title: text, subtitle: text, date: text, description: text })) })),
  sectionOrder: z.array(z.string()).catch([...BUILTIN_SECTIONS]).default([...BUILTIN_SECTIONS]),
});

/* -------------------------------------------------------------------------- */
/*  Tipler                                                                     */
/* -------------------------------------------------------------------------- */

export type Resume = z.infer<typeof resumeSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Language = z.infer<typeof languageSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CustomEntry = z.infer<typeof customEntrySchema>;
export type CustomSection = z.infer<typeof customSectionSchema>;

export type ResumeVersions = Partial<Record<ResumeLocale, Resume>>;

/** Bilinmeyen bir girdiyi (yedek, localStorage) güvenle Resume'a çevirir. */
export function parseResumeData(input: unknown): Resume | null {
  const parsed = resumeDataSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

export const resumeSettingsSchema = z.object({
  template: z.enum(TEMPLATE_IDS),
  locale: z.enum(RESUME_LOCALES),
  font: z.enum(CV_FONT_IDS),
});
export type ResumeSettings = z.infer<typeof resumeSettingsSchema>;
