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
    fullName: "Ayşe Yılmaz",
    title: "Kıdemli Frontend Geliştirici",
    email: "ayse.yilmaz@example.com",
    phone: "+90 555 123 45 67",
    location: "İstanbul, Türkiye",
    linkedin: "linkedin.com/in/ayseyilmaz",
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
