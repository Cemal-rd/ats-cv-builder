import { createId } from "@/lib/utils";
import {
  BUILTIN_SECTIONS,
  type Certification,
  type CustomEntry,
  type CustomSection,
  type Education,
  type Experience,
  type Language,
  type PersonalInfo,
  type Project,
  type Resume,
  type ResumeLocale,
  type SkillGroup,
} from "./resume";

export const createExperience = (): Experience => ({
  id: createId(),
  position: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

export const createEducation = (): Education => ({
  id: createId(),
  institution: "",
  degree: "",
  field: "",
  location: "",
  startDate: "",
  endDate: "",
  gpa: "",
  description: "",
});

export const createSkillGroup = (): SkillGroup => ({ id: createId(), category: "", items: "" });

export const createLanguage = (): Language => ({ id: createId(), name: "", level: "b1" });

export const createCertification = (): Certification => ({
  id: createId(),
  name: "",
  issuer: "",
  date: "",
  url: "",
});

export const createProject = (): Project => ({
  id: createId(),
  name: "",
  role: "",
  url: "",
  startDate: "",
  endDate: "",
  description: "",
});

export const createCustomEntry = (): CustomEntry => ({
  id: createId(),
  title: "",
  subtitle: "",
  date: "",
  description: "",
});

export const createCustomSection = (title = "", icon = "list"): CustomSection => ({
  id: createId(),
  title,
  icon,
  entries: [createCustomEntry()],
});

const createEmptyPersonal = (): PersonalInfo => ({
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  photo: "",
  showPhoto: false,
  birthDate: "",
  militaryStatus: "",
  drivingLicense: "",
});

export const createEmptyResume = (): Resume => ({
  personal: createEmptyPersonal(),
  summary: "",
  experience: [createExperience()],
  education: [createEducation()],
  skills: [createSkillGroup()],
  languages: [createLanguage()],
  certifications: [],
  projects: [],
  customSections: [],
  sectionOrder: [...BUILTIN_SECTIONS],
});

/** İlk açılışta önizlemenin boş görünmemesi için kurgusal örnek veri. */
export const createSampleResume = (): Resume => ({
  personal: {
    ...createEmptyPersonal(),
    fullName: "Ali Veli",
    title: "Kıdemli Frontend Geliştirici",
    email: "ali.veli@example.com",
    phone: "+90 555 123 45 67",
    location: "İstanbul, Türkiye",
    linkedin: "linkedin.com/in/aliveli",
    drivingLicense: "B",
  },
  summary:
    "6 yıllık deneyime sahip, React, TypeScript ve Next.js ekosisteminde uzmanlaşmış Kıdemli Frontend Geliştirici. " +
    "Yüksek trafikli web uygulamalarında performans optimizasyonu, erişilebilirlik ve ölçeklenebilir bileşen mimarileri " +
    "konusunda kanıtlanmış başarı. Çapraz fonksiyonlu ekiplerle kullanıcı odaklı ürünler geliştirmeye odaklıyım.",
  experience: [
    {
      ...createExperience(),
      position: "Kıdemli Frontend Geliştirici",
      company: "Örnek Teknoloji A.Ş.",
      location: "İstanbul",
      startDate: "Oca 2022",
      current: true,
      description: [
        "React ve TypeScript ile 120.000+ aktif kullanıcıya hizmet veren müşteri panelini yeniden tasarladım.",
        "Sayfa yükleme süresini kod bölme ve önbellekleme ile %45 azalttım.",
        "5 kişilik frontend ekibine teknik liderlik ettim ve kod inceleme süreçlerini standartlaştırdım.",
        "CI/CD hattına otomatik testler ekleyerek üretim hatalarını %30 düşürdüm.",
      ].join("\n"),
    },
    {
      ...createExperience(),
      position: "Frontend Geliştirici",
      company: "Dijital Ajans Ltd.",
      location: "Ankara",
      startDate: "Haz 2019",
      endDate: "Ara 2021",
      description: [
        "Next.js ile 15'ten fazla kurumsal web sitesi geliştirdim.",
        "Erişilebilirlik (WCAG 2.1) standartlarını tüm projelerde uyguladım.",
        "Tasarım ekibiyle birlikte yeniden kullanılabilir bir bileşen kütüphanesi oluşturdum.",
      ].join("\n"),
    },
  ],
  education: [
    {
      ...createEducation(),
      institution: "Örnek Üniversitesi",
      degree: "Lisans",
      field: "Bilgisayar Mühendisliği",
      location: "Ankara",
      startDate: "2015",
      endDate: "2019",
      gpa: "3.45/4.00",
    },
  ],
  skills: [
    { ...createSkillGroup(), category: "Frontend", items: "React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS" },
    { ...createSkillGroup(), category: "Araçlar", items: "Git, Jest, Playwright, Docker, Figma" },
  ],
  languages: [
    { ...createLanguage(), name: "Türkçe", level: "native" },
    { ...createLanguage(), name: "İngilizce", level: "c1" },
  ],
  certifications: [
    { ...createCertification(), name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2023" },
  ],
  projects: [
    {
      ...createProject(),
      name: "Açık Kaynak Form Kütüphanesi",
      role: "Geliştirici",
      url: "github.com/ornek/form-kit",
      startDate: "2023",
      description: [
        "Zod tabanlı şema doğrulamasıyla tip güvenli bir form kütüphanesi geliştirdim.",
        "GitHub'da 800+ yıldız alan projeyi 20+ katkıcıyla birlikte yönettim.",
      ].join("\n"),
    },
  ],
  customSections: [],
  sectionOrder: [...BUILTIN_SECTIONS],
});

/** English sample resume (fictional) — shown on the English interface and English resume version. */
export const createSampleResumeEn = (): Resume => ({
  personal: {
    ...createEmptyPersonal(),
    fullName: "John Doe",
    title: "Senior Frontend Engineer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    website: "github.com/johndoe",
  },
  summary:
    "Senior Frontend Engineer with 6+ years of experience building fast, accessible web applications with React, " +
    "TypeScript and Next.js. Proven track record of improving performance for high-traffic products and scaling " +
    "component libraries across teams. Focused on shipping user-centered features with cross-functional partners.",
  experience: [
    {
      ...createExperience(),
      position: "Senior Frontend Engineer",
      company: "Acme Technologies Inc.",
      location: "San Francisco, CA",
      startDate: "Jan 2022",
      current: true,
      description: [
        "Redesigned the customer dashboard used by 120,000+ active users with React and TypeScript.",
        "Reduced page load time by 45% through code splitting and caching.",
        "Led a team of 5 frontend engineers and standardized the code review process.",
        "Cut production bugs by 30% by adding automated tests to the CI/CD pipeline.",
      ].join("\n"),
    },
    {
      ...createExperience(),
      position: "Frontend Engineer",
      company: "Bright Digital Agency",
      location: "Austin, TX",
      startDate: "Jun 2019",
      endDate: "Dec 2021",
      description: [
        "Built 15+ corporate websites with Next.js for clients in finance and retail.",
        "Implemented WCAG 2.1 accessibility standards across all client projects.",
        "Created a reusable component library with the design team, cutting delivery time by 25%.",
      ].join("\n"),
    },
  ],
  education: [
    {
      ...createEducation(),
      institution: "Example State University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "Boston, MA",
      startDate: "2015",
      endDate: "2019",
      gpa: "3.7/4.0",
    },
  ],
  skills: [
    { ...createSkillGroup(), category: "Frontend", items: "React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS" },
    { ...createSkillGroup(), category: "Tools", items: "Git, Jest, Playwright, Docker, Figma" },
  ],
  languages: [
    { ...createLanguage(), name: "English", level: "native" },
    { ...createLanguage(), name: "Spanish", level: "b2" },
  ],
  certifications: [
    { ...createCertification(), name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2023" },
  ],
  projects: [
    {
      ...createProject(),
      name: "Open-Source Form Library",
      role: "Maintainer",
      url: "github.com/johndoe/form-kit",
      startDate: "2023",
      description: [
        "Developed a type-safe form library with Zod-based schema validation.",
        "Grew the project to 800+ GitHub stars with 20+ contributors.",
      ].join("\n"),
    },
  ],
  customSections: [],
  sectionOrder: [...BUILTIN_SECTIONS],
});

/** Dile göre örnek CV: Türkçe → Ali Veli, İngilizce → John Doe. */
export const createSampleResumeFor = (locale: ResumeLocale): Resume =>
  locale === "en" ? createSampleResumeEn() : createSampleResume();

const SAMPLE_EMAILS = new Set([
  "ali.veli@example.com",
  "john.doe@example.com",
  "ayse.yilmaz@example.com", // eski Türkçe örnek — kayıtlı verilerde hâlâ örnek sayılsın
]);

/** Kullanıcı örnek CV'yi henüz kendi bilgileriyle değiştirmediyse true. */
export const isSampleResume = (resume: Resume): boolean =>
  SAMPLE_EMAILS.has(resume.personal.email.trim().toLowerCase());

/**
 * Eski Türkçe örnek CV'nin (Ayşe Yılmaz) kimlik alanlarını yeni örneğe (Ali Veli) çevirir.
 * Yalnızca ad ve e-posta hâlâ eski örnekteyse uygulanır; kullanıcının diğer düzenlemeleri korunur.
 */
export function renameLegacySample(resume: Resume): Resume {
  const { personal } = resume;
  if (personal.fullName !== "Ayşe Yılmaz" || personal.email !== "ayse.yilmaz@example.com") return resume;
  return {
    ...resume,
    personal: {
      ...personal,
      fullName: "Ali Veli",
      email: "ali.veli@example.com",
      linkedin: personal.linkedin === "linkedin.com/in/ayseyilmaz" ? "linkedin.com/in/aliveli" : personal.linkedin,
    },
  };
}
