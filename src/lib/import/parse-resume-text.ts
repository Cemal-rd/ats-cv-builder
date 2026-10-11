import { resumeLabels } from "@/lib/resume/labels";
import { customSectionKey } from "@/lib/resume/sections";
import {
  createCertification,
  createCustomEntry,
  createCustomSection,
  createEducation,
  createExperience,
  createLanguage,
  createProject,
  createSkillGroup,
} from "@/lib/schema/factories";
import type {
  Certification,
  CustomSection,
  Education,
  Experience,
  Language,
  PersonalInfo,
  Project,
  Resume,
  SkillGroup,
} from "@/lib/schema/resume";
import {
  clip,
  COMPANY_HINT,
  CONTACT_SEPARATOR,
  DEGREE_HINT,
  detectHeading,
  detectLanguageLevel,
  EMAIL_RE,
  findDateRange,
  findPhone,
  findUrls,
  GPA_RE,
  INSTITUTION_HINT,
  isAllCaps,
  isBulletLine,
  isContactLike,
  isMarkerOnlyLine,
  LINKEDIN_RE,
  looksLikeLocation,
  looksLikeUnknownHeading,
  PART_SEPARATOR,
  stripBullet,
  stripLanguageLevel,
  toTitleCase,
  wordCount,
  type DetectedHeading,
  type DetectedSectionKind,
  type FoundDate,
} from "./patterns";
import { hasActionVerb } from "@/lib/ats/action-verbs";

/**
 * Kural tabanlı CV ayrıştırıcı. Düz metni bölümlere ayırır ve her bölümü
 * kendi kurallarıyla Resume modeline çevirir. Sonuç %100 doğru olmayabilir;
 * kullanıcı aktarımdan önce özeti, sonra formda alanları kontrol eder.
 */

export interface ImportedSectionSummary {
  kind: DetectedSectionKind;
  title: string;
  count: number;
  /** Kontrol ekranında gösterilecek ilk birkaç kaydın başlığı. */
  preview: string[];
}

export interface ResumeImportResult {
  resume: Resume;
  sections: ImportedSectionSummary[];
  warnings: string[];
}

interface Block {
  kind: DetectedSectionKind;
  title: string;
  lines: string[];
}

interface RawEntry {
  header: string[];
  bullets: string[];
  date: FoundDate | null;
  /** Tarih bulunduğunda kaç başlık satırı vardı: >0 ise tarih kaydı "kapatır". */
  headerCountAtDate: number;
}

const LONG_SENTENCE_WORDS = 10;

/* -------------------------------------------------------------------------- */
/*  Giriş noktası                                                              */
/* -------------------------------------------------------------------------- */

export function parseResumeText(raw: string): ResumeImportResult {
  const lines = normalizeLines(raw);
  const warnings: string[] = [];
  if (lines.join(" ").length < 80) {
    warnings.push(
      "Dosyadan neredeyse hiç metin çıkmadı. Taranmış (fotoğraf) bir PDF olabilir; ATS sistemleri de bu dosyayı okuyamaz.",
    );
  }

  const { header, blocks } = splitIntoBlocks(lines);
  if (blocks.length === 0 && lines.length > 5) {
    warnings.push("Bölüm başlıkları (Deneyim, Eğitim, Yetenekler…) tanınamadı. Bilgilerin bir kısmı özet alanına aktarıldı.");
  }

  const fullText = lines.join("\n");
  const personal = parsePersonal(header, fullText);

  const byKind = (kind: DetectedSectionKind) => blocks.filter((b) => b.kind === kind).flatMap((b) => b.lines);
  const experience = parseExperience(byKind("experience"));
  const education = parseEducation(byKind("education"));
  const skills = parseSkills(byKind("skills"));
  const languages = parseLanguages(byKind("languages"));
  const certifications = parseCertifications(byKind("certifications"));
  const projects = parseProjects(byKind("projects"));
  const customSections = blocks.filter((b) => b.kind === "custom").map(parseCustomSection).filter(hasEntries);

  const summaryLines = byKind("summary");
  const fallbackSummary = blocks.length === 0 ? header.slice(personal.consumedHeaderLines) : header.filter((l) => wordCount(l) >= 12);
  const summary = clip(joinParagraph(summaryLines.length ? summaryLines : fallbackSummary), 1500);

  const resume: Resume = {
    personal: personal.info,
    summary,
    experience,
    education,
    skills,
    languages,
    certifications,
    projects,
    customSections,
    sectionOrder: buildSectionOrder(blocks, customSections),
  };

  return { resume, sections: summarizeSections(resume), warnings };
}

/* -------------------------------------------------------------------------- */
/*  Ön işleme ve bölümleme                                                     */
/* -------------------------------------------------------------------------- */

function normalizeLines(raw: string): string[] {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[   \t]/g, " ")
    .replace(/[​﻿­]/g, "")
    .split("\n")
    .map((line) =>
      line
        // Word/Symbol madde işareti (ör. U+F0B7) → standart "•"; satır içindeki diğer
        // özel kullanım karakterleri (telefon/e-posta ikonları) silinir.
        .replace(/^\s*[-]\s*/u, "• ")
        .replace(/[-]/gu, "")
        .replace(/ {2,}/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .reduce<string[]>((lines, line) => {
      // Tek başına kalan madde işareti bir önceki satırdan taşmıştır; sonraki satırla birleşir.
      const previous = lines[lines.length - 1];
      if (previous !== undefined && isMarkerOnlyLine(previous) && !isMarkerOnlyLine(line)) {
        lines[lines.length - 1] = `• ${line}`;
      } else {
        lines.push(line);
      }
      return lines;
    }, [])
    .filter((line) => !isMarkerOnlyLine(line));
}

/** Kişisel bilgi alanlarına aktarılan etiketli satırlar; bölümlere karışmasın. */
const PERSONAL_DETAIL_LINE =
  /^(?:askerlik|ehliyet|sürücü\s+belgesi|doğum\s+(?:tarihi|yeri)|medeni\s+durum|uyruk|military\s+service|driving\s+licen[cs]e|date\s+of\s+birth|marital\s+status|nationality)(?![\p{L}])/iu;

/** Bu bölümlerde "Diller: Go, Java" gibi satırlar kategori etiketidir, yeni bölüm başlığı değil. */
const LABELED_LIST_SECTIONS = new Set<DetectedSectionKind>(["skills", "languages", "certifications"]);

function splitIntoBlocks(lines: string[]) {
  const header: string[] = [];
  const blocks: Block[] = [];

  for (const line of lines) {
    if (PERSONAL_DETAIL_LINE.test(line)) continue;

    const current = blocks[blocks.length - 1];
    let heading: DetectedHeading | null = detectHeading(line);
    if (heading?.rest && current && LABELED_LIST_SECTIONS.has(current.kind)) heading = null;
    heading ??=
      current && looksLikeUnknownHeading(line)
        ? { kind: "custom", title: toTitleCase(line.trim()), rest: "" }
        : null;

    if (heading) {
      blocks.push({ kind: heading.kind, title: heading.title, lines: heading.rest ? [heading.rest] : [] });
    } else if (blocks.length === 0) {
      header.push(line);
    } else {
      blocks[blocks.length - 1].lines.push(line);
    }
  }
  return { header, blocks };
}

/* -------------------------------------------------------------------------- */
/*  Kişisel bilgiler                                                           */
/* -------------------------------------------------------------------------- */

function looksLikeName(line: string): boolean {
  if (isContactLike(line) || line.length > 45) return false;
  const words = line.split(/\s+/);
  return words.length >= 2 && words.length <= 5 && words.every((w) => /^[\p{L}][\p{L}.'-]*$/u.test(w));
}

function parsePersonal(header: string[], fullText: string) {
  const email = EMAIL_RE.exec(fullText)?.[0] ?? "";
  const linkedin = LINKEDIN_RE.exec(fullText)?.[0] ?? "";
  const headerText = header.join("\n");
  const phone = findPhone(headerText) || findPhone(fullText);

  const emailDomain = email.split("@")[1]?.toLowerCase();
  const website =
    findUrls(headerText).concat(findUrls(fullText)).find((url) => {
      const lower = url.toLowerCase().replace(/^https?:\/\/(www\.)?/, "");
      return !lower.includes("linkedin.com") && !(emailDomain && lower.startsWith(emailDomain));
    }) ?? "";

  // Ad ve unvan: başlık bölgesinin iletişim içermeyen ilk satırları.
  let fullName = "";
  let title = "";
  let consumed = 0;
  const textLines = header.slice(0, 8);
  for (let i = 0; i < textLines.length && (!fullName || !title); i++) {
    const segments = textLines[i].split(CONTACT_SEPARATOR).map((s) => s.trim()).filter(Boolean);
    for (const segment of segments) {
      if (isContactLike(segment)) continue;
      // Ad, şehir adı içerebilir ("Emre Aydın", "Ayşe Bursa"): ilk iki satırda konum kontrolü yapılmaz.
      if (!fullName && looksLikeName(segment) && (i < 2 || !looksLikeLocation(segment))) {
        fullName = isAllCaps(segment) ? toTitleCase(segment) : segment;
        consumed = i + 1;
      } else if (fullName && !title && wordCount(segment) <= 8 && segment !== fullName && !looksLikeLocation(segment)) {
        title = isAllCaps(segment) ? toTitleCase(segment) : segment;
        consumed = i + 1;
      }
    }
  }

  const headerSegments = header
    .flatMap((line) => line.split(CONTACT_SEPARATOR))
    .map((s) => s.trim())
    .filter((s) => s && !isContactLike(s) && s !== fullName && s !== title);
  const location =
    headerSegments.find(looksLikeLocation) ?? headerSegments.find((s) => CITY_COMMA_REGION.test(s)) ?? "";

  const info: PersonalInfo = {
    fullName: clip(fullName, 80),
    title: clip(title, 100),
    email,
    phone: clip(phone, 20),
    location: clip(location.replace(/^(?:adres|address|konum|location)\s*:\s*/i, ""), 100),
    linkedin: linkedin.replace(/\/$/, ""),
    website: website.replace(/\/$/, ""),
    photo: "",
    showPhoto: false,
    birthDate: findLabeled(fullText, /(?:doğum\s+tarihi|date\s+of\s+birth|d\.\s*tarihi)\s*:?\s*([\d./-]{6,10})/iu),
    militaryStatus: findLabeled(fullText, /(?:askerlik(?:\s+durumu)?|military\s+service)\s*:?\s*([\p{L}][\p{L}\s()\d.]{2,40}?)(?=\s*[|·•]|\n|$)/imu),
    drivingLicense: findLabeled(fullText, /(?:ehliyet|sürücü\s+belgesi|driving\s+licen[cs]e)\s*:?\s*([A-E][\d]?(?:\s*[,/]\s*[A-E][\d]?)*)(?![\p{L}])/iu),
  };
  return { info, consumedHeaderLines: consumed };
}

/** "San Francisco, CA", "Lyon, France" — başlıktaki "Şehir, Bölge" kalıbı. */
const CITY_COMMA_REGION = /^\p{Lu}[\p{L}.'-]*(?:\s\p{Lu}[\p{L}.'-]*){0,2},\s*\p{Lu}[\p{L}.'-]*(?:\s\p{Lu}[\p{L}.'-]*){0,2}$/u;

const findLabeled = (text: string, pattern: RegExp) => clip(pattern.exec(text)?.[1]?.trim() ?? "", 30);

/* -------------------------------------------------------------------------- */
/*  Kayıt bölme (deneyim, eğitim, proje, özel bölümler için ortak)             */
/* -------------------------------------------------------------------------- */

/** Şirket kısaltmasıyla bitmeyen, noktalı ve en az 5 kelimelik satır cümledir (açıklama). */
const COMPANY_SUFFIX_END = /(?:a\.ş|ltd|şti|inc|corp|co|llc|gmbh)\.$/i;
const isSentence = (line: string) =>
  hasActionVerb(line) || (/[.!]$/.test(line) && wordCount(line) >= 5 && !COMPANY_SUFFIX_END.test(line));

/**
 * @param isDetail Yeni kayıt başlatmaması gereken ek bilgi satırları (ör. eğitimde "GPA: 3.2").
 */
function splitEntries(lines: string[], isDetail: (line: string) => boolean = () => false): RawEntry[] {
  const entries: RawEntry[] = [];
  const newEntry = (): RawEntry => {
    const entry: RawEntry = { header: [], bullets: [], date: null, headerCountAtDate: 0 };
    entries.push(entry);
    return entry;
  };

  for (const line of lines) {
    const entry: RawEntry | undefined = entries[entries.length - 1];

    if (isBulletLine(line)) {
      (entry ?? newEntry()).bullets.push(stripBullet(line));
      continue;
    }

    const date = findDateRange(line);

    // Satır kaymış madde devamı: küçük harfle başlar, tarih içermez.
    if (entry && entry.bullets.length > 0 && !date && /^[\p{Ll}(]/u.test(line)) {
      entry.bullets[entry.bullets.length - 1] += ` ${line}`;
      continue;
    }
    // İşaretsiz uzun cümle, eylem cümlesi veya ek bilgi satırı: mevcut kaydın açıklamasıdır.
    if (entry && !date && (wordCount(line) >= LONG_SENTENCE_WORDS || isSentence(line) || isDetail(line))) {
      entry.bullets.push(line);
      continue;
    }

    const needsNewEntry =
      !entry ||
      entry.bullets.length > 0 ||
      (date !== null && entry.date !== null) ||
      (date === null && entry.date !== null && entry.headerCountAtDate > 0) ||
      entry.header.length >= 3;
    const target = needsNewEntry || !entry ? newEntry() : entry;

    if (date && !target.date) {
      target.date = date;
      target.headerCountAtDate = target.header.length;
      const rest = cleanParts(line.replace(date.match, " "));
      if (rest) target.header.push(rest);
    } else {
      target.header.push(line);
    }
  }
  return entries.filter((e) => e.header.length > 0 || e.bullets.length > 0);
}

/** Parça kenarlarındaki ayırıcı artıklarını siler; parantezleri yalnızca eşsizse atar. */
function trimPart(part: string): string {
  let p = part
    .replace(/\(\s*\)|\[\s*\]/g, " ")
    .replace(/^[\s|·•,–—:-]+|[\s|·•,–—:-]+$/g, "")
    .trim();
  const opens = (p.match(/\(/g) ?? []).length;
  const closes = (p.match(/\)/g) ?? []).length;
  if (closes > opens) p = p.replace(/\)\s*$/, "").trim();
  if (opens > closes) p = p.replace(/^\(\s*/, "").replace(/\s*\($/, "").trim();
  return p === "()" ? "" : p;
}

/** Tarih çıkarıldıktan sonra kalan ayırıcı artıklarını temizler: "Şirket |  | " → "Şirket". */
function cleanParts(text: string): string {
  return text.split(PART_SEPARATOR).map(trimPart).filter(Boolean).join(" | ");
}

function headerParts(entry: RawEntry): string[] {
  return entry.header.flatMap((line) => line.split(PART_SEPARATOR)).map(trimPart).filter(Boolean);
}

const description = (entry: RawEntry, max: number) => clip(entry.bullets.join("\n"), max);

/* -------------------------------------------------------------------------- */
/*  Bölüm ayrıştırıcıları                                                      */
/* -------------------------------------------------------------------------- */

/** "Ankara Fen Lisesi", "İstanbul Teknoloji A.Ş." şehir adı içerse de konum değildir. */
const isLocationPart = (part: string) =>
  looksLikeLocation(part) && !COMPANY_HINT.test(part) && !INSTITUTION_HINT.test(part);

function parseExperience(lines: string[]): Experience[] {
  return splitEntries(lines).map((entry) => {
    const parts = headerParts(entry);
    const location = parts.find(isLocationPart) ?? "";
    const rest = parts.filter((p) => p !== location);
    const company = rest.find((p) => COMPANY_HINT.test(p)) ?? (rest.length > 1 ? rest[1] : "");
    const position = rest.find((p) => p !== company) ?? "";

    return {
      ...createExperience(),
      position: clip(position, 100),
      company: clip(company, 100),
      location: clip(location, 100),
      startDate: clip(entry.date?.start ?? "", 30),
      endDate: clip(entry.date?.end ?? "", 30),
      current: entry.date?.current ?? false,
      description: description(entry, 3000),
    };
  });
}

function parseEducation(lines: string[]): Education[] {
  // "İstatistik, Lisans · Not Ort.: 3.40" → ["İstatistik | Lisans", "Not Ort.: 3.40"]: not ayrı satıra alınır,
  // böylece aynı satırdaki bölüm/derece bilgisi kaybolmaz.
  const separated = lines.flatMap((line) => {
    const gpa = GPA_RE.exec(line);
    if (!gpa) return [line];
    const rest = cleanParts(line.replace(gpa[0], " "));
    return rest ? [rest, gpa[0]] : [gpa[0]];
  });
  const isGpaLine = (line: string) => GPA_RE.exec(line)?.[0] === line;

  return splitEntries(separated, isGpaLine).map((entry) => {
    const allText = [...entry.header, ...entry.bullets].join(" ");
    const gpa = GPA_RE.exec(allText)?.[1] ?? "";
    const parts = headerParts(entry).filter((p) => !GPA_RE.test(p));
    const location = parts.find(isLocationPart) ?? "";
    const rest = parts.filter((p) => p !== location);

    const institution = rest.find((p) => INSTITUTION_HINT.test(p)) ?? rest[0] ?? "";
    let degree = rest.find((p) => p !== institution && DEGREE_HINT.test(p)) ?? "";
    let field = rest.find((p) => p !== institution && p !== degree) ?? "";

    // "B.Sc. in Computer Science" / "Bilgisayar Mühendisliği (Lisans)"
    const inMatch = /^(.+?)\s+(?:in|of)\s+(.+)$/i.exec(degree);
    if (inMatch && !field) [degree, field] = [inMatch[1], inMatch[2]];
    const parenMatch = /^(.+?)\s*\(([^)]+)\)$/.exec(field || degree);
    if (parenMatch && DEGREE_HINT.test(parenMatch[2])) [field, degree] = [parenMatch[1], parenMatch[2]];

    return {
      ...createEducation(),
      institution: clip(institution, 100),
      degree: clip(degree, 100),
      field: clip(field, 100),
      location: clip(location, 100),
      startDate: clip(entry.date?.start ?? "", 30),
      endDate: clip(entry.date?.current ? "" : entry.date?.end ?? "", 30),
      gpa: clip(gpa.replace(/\s+/g, ""), 20),
      description: clip(entry.bullets.filter((b) => !GPA_RE.test(b)).join("\n"), 1000),
    };
  });
}

function parseProjects(lines: string[]): Project[] {
  return splitEntries(lines).map((entry) => {
    const parts = headerParts(entry);
    const url = findUrls(entry.header.join(" "))[0] ?? "";
    const rest = parts.filter((p) => !url || !url.includes(p.replace(/^https?:\/\//, "")));
    return {
      ...createProject(),
      name: clip(rest[0] ?? "", 100),
      role: clip(rest.slice(1).join(", "), 100),
      url: url.replace(/\/$/, ""),
      startDate: clip(entry.date?.start ?? "", 30),
      endDate: clip(entry.date?.current ? "" : entry.date?.end ?? "", 30),
      description: description(entry, 2000),
    };
  });
}

function parseSkills(lines: string[]): SkillGroup[] {
  const groups: SkillGroup[] = [];
  const loose: string[] = [];

  for (const raw of lines) {
    const line = stripBullet(raw);
    const labeled = /^([^:]{2,40}):\s*(.+)$/.exec(line);
    if (labeled && wordCount(labeled[1]) <= 4) {
      groups.push({ ...createSkillGroup(), category: clip(labeled[1].trim(), 60), items: clip(splitItems(labeled[2]).join(", "), 500) });
    } else {
      loose.push(...splitItems(line));
    }
  }
  if (loose.length) groups.unshift({ ...createSkillGroup(), items: clip([...new Set(loose)].join(", "), 500) });
  return groups;
}

const splitItems = (text: string) =>
  text
    .split(/\s*[,;|•·]\s*|\s{2,}/)
    .map((s) => s.replace(/^[-–—\s]+|[.\s]+$/g, "").trim())
    .filter((s) => s && s.length <= 60);

function parseLanguages(lines: string[]): Language[] {
  const segments = lines.flatMap((line) => {
    const clean = stripBullet(line);
    // Bir satırda birden fazla dil: "Türkçe (Ana dil), İngilizce (C1)"
    return clean.split(/\s*[,;|•·]\s*(?![^()]*\))/).filter(Boolean);
  });

  const languages: Language[] = [];
  for (const segment of segments) {
    const { level } = detectLanguageLevel(segment);
    const name = stripLanguageLevel(segment).replace(/\s+/g, " ").trim();
    if (!name || name.length > 25 || wordCount(name) > 3 || /\d/.test(name)) continue;
    languages.push({ ...createLanguage(), name: clip(isAllCaps(name) ? toTitleCase(name) : name, 40), level });
  }
  return languages;
}

function parseCertifications(lines: string[]): Certification[] {
  const merged: string[] = [];
  for (const raw of lines) {
    const line = stripBullet(raw);
    // Küçük harfle başlayan satır bir öncekinin devamıdır.
    if (merged.length && /^[\p{Ll}(]/u.test(line)) merged[merged.length - 1] += ` ${line}`;
    else merged.push(line);
  }

  return merged.map((line) => {
    const date = findDateRange(line);
    const url = findUrls(line)[0] ?? "";
    let text = date ? line.replace(date.match, " ") : line;
    if (url) text = text.replace(url, " ");
    const parts = text.split(PART_SEPARATOR).map(trimPart).filter(Boolean);
    return {
      ...createCertification(),
      name: clip(parts[0] ?? "", 120),
      issuer: clip(parts.slice(1).join(", "), 100),
      date: clip(date ? (date.current ? date.start : [date.start, date.end].filter(Boolean).join(" – ")) : "", 30),
      url: url.replace(/\/$/, ""),
    };
  });
}

function parseCustomSection(block: Block): CustomSection {
  const section = createCustomSection(clip(block.title, 60), iconForTitle(block.title));
  const hasStructure = block.lines.some((l) => isBulletLine(l) || findDateRange(l));

  // Basit liste (hobiler, referans adları…): her satır bir kayıt.
  if (!hasStructure) {
    section.entries = block.lines.map((line) => ({ ...createCustomEntry(), title: clip(line, 120) }));
    return section;
  }

  section.entries = splitEntries(block.lines).map((entry) => {
    const parts = headerParts(entry);
    return {
      ...createCustomEntry(),
      title: clip(parts[0] ?? "", 120),
      subtitle: clip(parts.slice(1).join(", "), 120),
      date: clip(entry.date ? [entry.date.start, entry.date.current ? "" : entry.date.end].filter(Boolean).join(" – ") : "", 30),
      description: description(entry, 2000),
    };
  });
  return section;
}

const hasEntries = (section: CustomSection) => section.entries.length > 0;

function iconForTitle(title: string): string {
  const lower = title.toLocaleLowerCase("tr-TR");
  if (/gönüllü|volunteer/.test(lower)) return "volunteer";
  if (/yayın|makale|publication/.test(lower)) return "publication";
  if (/ödül|başarı|burs|award|honor|achievement/.test(lower)) return "award";
  if (/referans|reference/.test(lower)) return "reference";
  if (/konferans|seminer|konuşma|conference|talk/.test(lower)) return "talk";
  if (/hobi|ilgi|interest|hobb/.test(lower)) return "star";
  return "list";
}

/* -------------------------------------------------------------------------- */
/*  Son işlemler                                                               */
/* -------------------------------------------------------------------------- */

function joinParagraph(lines: string[]): string {
  return lines
    .map((l) => (isBulletLine(l) ? `\n${stripBullet(l)}` : l))
    .join(" ")
    .replace(/ *\n */g, "\n")
    .trim();
}

/** Bölümler CV'deki orijinal sırasıyla gelsin. */
function buildSectionOrder(blocks: Block[], customSections: CustomSection[]): string[] {
  const order: string[] = [];
  let customIndex = 0;
  for (const block of blocks) {
    if (block.kind === "summary") continue;
    if (block.kind === "custom") {
      const section = customSections[customIndex];
      if (section && section.title === clip(block.title, 60)) {
        order.push(customSectionKey(section.id));
        customIndex++;
      }
    } else if (!order.includes(block.kind)) {
      order.push(block.kind);
    }
  }
  return order;
}

function summarizeSections(resume: Resume): ImportedSectionSummary[] {
  const summaries: ImportedSectionSummary[] = [
    {
      kind: "experience",
      title: "İş Deneyimi",
      count: resume.experience.length,
      preview: resume.experience.map((e) => [e.position, e.company].filter(Boolean).join(" · ")),
    },
    {
      kind: "education",
      title: "Eğitim",
      count: resume.education.length,
      preview: resume.education.map((e) => [e.institution, e.degree].filter(Boolean).join(" · ")),
    },
    {
      kind: "skills",
      title: "Yetenekler",
      count: resume.skills.reduce((sum, g) => sum + g.items.split(",").filter((s) => s.trim()).length, 0),
      preview: resume.skills.map((g) => (g.category ? `${g.category}: ${g.items}` : g.items)),
    },
    {
      kind: "languages",
      title: "Yabancı Diller",
      count: resume.languages.length,
      preview: resume.languages.map((l) => `${l.name} (${resumeLabels.tr.languageLevels[l.level]})`),
    },
    {
      kind: "projects",
      title: "Projeler",
      count: resume.projects.length,
      preview: resume.projects.map((p) => p.name),
    },
    {
      kind: "certifications",
      title: "Sertifikalar",
      count: resume.certifications.length,
      preview: resume.certifications.map((c) => c.name),
    },
    ...resume.customSections.map((s) => ({
      kind: "custom" as const,
      title: s.title,
      count: s.entries.length,
      preview: s.entries.map((e) => e.title || e.description.split("\n")[0]),
    })),
  ];
  return summaries.map((s) => ({ ...s, preview: s.preview.filter(Boolean).slice(0, 3) }));
}
