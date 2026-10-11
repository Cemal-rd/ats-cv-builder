import { z } from "zod";
import { createId } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Sabitler                                                                   */
/* -------------------------------------------------------------------------- */

export const TEMPLATE_IDS = ["classic", "modern"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const RESUME_LOCALES = ["tr", "en"] as const;
export type ResumeLocale = (typeof RESUME_LOCALES)[number];

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

const id = z.string().min(1);
const shortText = (max = 100) => z.string().trim().max(max, `En fazla ${max} karakter`);
const longText = (max: number) => z.string().max(max, `En fazla ${max} karakter`);
const dateText = shortText(30);
const optionalLink = z
  .string()
  .trim()
  .regex(LINK_PATTERN, "Geçerli bir bağlantı girin (ör. linkedin.com/in/adiniz)")
  .or(z.literal(""));

/* -------------------------------------------------------------------------- */
/*  Bölüm şemaları (form doğrulaması için)                                     */
/* -------------------------------------------------------------------------- */

export const personalInfoSchema = z.object({
  fullName: shortText(80),
  title: shortText(100),
  email: z.string().trim().email("Geçerli bir e-posta adresi girin").or(z.literal("")),
  phone: z.string().trim().regex(PHONE_PATTERN, "Geçerli bir telefon numarası girin").or(z.literal("")),
  location: shortText(100),
  linkedin: optionalLink,
  website: optionalLink,
  /** Küçültülmüş JPEG data URL'i. */
  photo: z.string(),
  showPhoto: z.boolean(),
  /* Türkiye'ye özel, opsiyonel alanlar */
  birthDate: shortText(30),
  militaryStatus: shortText(60),
  drivingLicense: shortText(30),
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
  description: longText(3000),
});

export const educationSchema = z.object({
  id,
  institution: shortText(),
  degree: shortText(),
  field: shortText(),
  location: shortText(),
  startDate: dateText,
  endDate: dateText,
  gpa: shortText(20),
  description: longText(1000),
});

export const skillGroupSchema = z.object({
  id,
  category: shortText(60),
  /** Virgülle ayrılmış yetenek listesi. */
  items: longText(500),
});

export const languageSchema = z.object({
  id,
  name: shortText(40),
  level: z.enum(LANGUAGE_LEVELS),
});

export const certificationSchema = z.object({
  id,
  name: shortText(120),
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
  description: longText(2000),
});

export const customEntrySchema = z.object({
  id,
  title: shortText(120),
  subtitle: shortText(120),
  date: dateText,
  description: longText(2000),
});

export const customSectionSchema = z.object({
  id,
  title: shortText(60),
  /** Yalnızca editörde gösterilen simge anahtarı; CV çıktısına girmez. */
  icon: z.string().max(30),
  entries: z.array(customEntrySchema).max(30),
});

export const resumeSchema = z.object({
  personal: personalInfoSchema,
  summary: longText(1500),
  experience: z.array(experienceSchema).max(20),
  education: z.array(educationSchema).max(10),
  skills: z.array(skillGroupSchema).max(15),
  languages: z.array(languageSchema).max(15),
  certifications: z.array(certificationSchema).max(20),
  projects: z.array(projectSchema).max(15),
  customSections: z.array(customSectionSchema).max(10),
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
});
export type ResumeSettings = z.infer<typeof resumeSettingsSchema>;
