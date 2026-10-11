import type { BuiltinSectionKey, LanguageLevel } from "@/lib/schema/resume";

/* -------------------------------------------------------------------------- */
/*  Metin yardımcıları                                                         */
/* -------------------------------------------------------------------------- */

const TURKISH_CHARS = /[çğıöşüÇĞİÖŞÜ]/;

export const wordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export const clip = (text: string, max: number) => (text.length > max ? text.slice(0, max).trim() : text);

/** Hem Türkçe hem İngilizce küçük harf biçimi: "SKILLS" → "skills", "EĞİTİM" → "eğitim". */
export function lowerVariants(text: string): string[] {
  return [...new Set([text.toLocaleLowerCase("tr-TR"), text.toLowerCase()])];
}

export function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^\p{L}]/gu, "");
  return letters.length >= 3 && letters === letters.toLocaleUpperCase("tr-TR") && letters !== letters.toLocaleLowerCase("tr-TR");
}

/** "AYŞE YILMAZ" → "Ayşe Yılmaz". Türkçe harf varsa Türkçe kurallarıyla küçültür. */
export function toTitleCase(text: string): string {
  const locale = TURKISH_CHARS.test(text) ? "tr-TR" : "en-US";
  return text
    .toLocaleLowerCase(locale)
    .replace(/(^|[\s(/-])(\p{L})/gu, (_, prefix: string, letter: string) => prefix + letter.toLocaleUpperCase(locale));
}

/* -------------------------------------------------------------------------- */
/*  Madde işaretleri ve ayırıcılar                                             */
/* -------------------------------------------------------------------------- */

/**
 * Madde işareti karakterleri. -: Özel Kullanım Alanı — Word'ün Symbol/Wingdings
 * yazı tipiyle yazdığı madde işaretleri PDF'ten bu kodlarla (ör. U+F0B7 "") çıkar.
 */
export const BULLET_CHARS = "•●○◦▪▫■□➢➤►▶▸▹‣⁃∙◘✓✔☐☑❖◆◇★☆➔→⇒*·\\uE000-\\uF8FF";

const BULLET_RE = new RegExp(`^\\s*(?:[${BULLET_CHARS}]|[-–—](?=\\s)|\\d{1,2}[.)](?=\\s))\\s*`, "u");
const MARKER_ONLY_RE = new RegExp(`^[\\s${BULLET_CHARS}–—-]+$`, "u");

export const isBulletLine = (line: string) => BULLET_RE.test(line) && line.replace(BULLET_RE, "").trim().length > 0;
export const stripBullet = (line: string) => line.replace(BULLET_RE, "").trim();
/** Yalnızca madde işaretinden oluşan satır ("•", ""): metni bir sonraki satırdadır. */
export const isMarkerOnlyLine = (line: string) => MARKER_ONLY_RE.test(line);

/** Başlık satırlarını parçalara ayırır: "Pozisyon | Şirket, Şehir", "Pozisyon – Şirket", "Role at Company". */
export const PART_SEPARATOR = /\s*\|\s*|\s+[·•–—-]\s+|,\s+|\s+@\s+|\s+at\s+/u;

/** İletişim satırları için (virgül hariç: "İstanbul, Türkiye" bölünmesin). */
export const CONTACT_SEPARATOR = /\s*[|·•]\s*|\s{2,}|\s+[–—-]\s+/u;

/* -------------------------------------------------------------------------- */
/*  Bölüm başlıkları                                                           */
/* -------------------------------------------------------------------------- */

export type DetectedSectionKind = BuiltinSectionKey | "summary" | "custom";

const SECTION_HEADINGS: Record<Exclude<DetectedSectionKind, "custom">, string[]> = {
  summary: [
    "özet", "profesyonel özet", "kariyer özeti", "hakkımda", "kariyer hedefi", "kariyer hedefim", "profil",
    "kişisel profil", "ön yazı", "summary", "professional summary", "career summary", "profile", "about",
    "about me", "objective", "career objective", "personal statement",
  ],
  experience: [
    "deneyim", "deneyimler", "iş deneyimi", "iş deneyimleri", "iş tecrübesi", "iş tecrübeleri", "tecrübe",
    "tecrübeler", "profesyonel deneyim", "çalışma geçmişi", "çalışma deneyimi", "kariyer", "experience",
    "work experience", "professional experience", "employment", "employment history", "work history",
    "career history", "relevant experience",
  ],
  education: [
    "eğitim", "eğitim bilgileri", "eğitim bilgisi", "eğitim durumu", "öğrenim", "öğrenim durumu",
    "education", "academic background", "educational background", "academic history",
  ],
  skills: [
    "yetenekler", "beceriler", "yetkinlikler", "teknik beceriler", "teknik yetenekler", "teknik yetkinlikler",
    "bilgisayar becerileri", "uzmanlık alanları", "araçlar ve teknolojiler", "skills", "technical skills",
    "core competencies", "competencies", "key skills", "tools", "technologies", "tools & technologies",
    "tools and technologies", "skills & tools",
  ],
  languages: [
    "diller", "yabancı dil", "yabancı diller", "dil bilgisi", "dil becerileri", "languages", "language skills",
    "language",
  ],
  certifications: [
    "sertifikalar", "sertifika", "sertifikalar ve kurslar", "kurslar", "kurslar ve sertifikalar",
    "eğitimler ve sertifikalar", "lisanslar ve sertifikalar", "certifications", "certificates",
    "certifications & courses", "licenses & certifications", "licenses and certifications", "courses",
  ],
  projects: ["projeler", "proje", "kişisel projeler", "projects", "personal projects", "selected projects", "key projects"],
};

/** Özel bölüm olarak alınan, bilinen ek başlıklar. */
const CUSTOM_HEADINGS = [
  "gönüllü çalışmalar", "gönüllülük", "gönüllü deneyim", "yayınlar", "makaleler", "ödüller", "ödüller ve başarılar",
  "başarılar", "burslar", "referanslar", "hobiler", "ilgi alanları", "hobiler ve ilgi alanları", "konferanslar",
  "seminerler", "üyelikler", "kulüpler", "topluluklar", "volunteer", "volunteering", "volunteer experience",
  "publications", "awards", "honors", "honors & awards", "achievements", "references", "interests", "hobbies",
  "conferences", "talks", "memberships", "activities", "extracurricular activities", "leadership",
];

export interface DetectedHeading {
  kind: DetectedSectionKind;
  title: string;
  /** "Yetenekler: React, Node" gibi başlıkla aynı satırdaki içerik. */
  rest: string;
}

const cleanHeading = (text: string) =>
  text.replace(/^[^\p{L}]+|[^\p{L})]+$/gu, "").replace(/\s+/g, " ").trim();

function matchHeading(candidate: string): Omit<DetectedHeading, "rest"> | null {
  const clean = cleanHeading(candidate);
  if (!clean || clean.length > 40 || wordCount(clean) > 5) return null;
  const variants = lowerVariants(clean).flatMap((v) => [v, v.replace(/\s*&\s*/g, " ve "), v.replace(/\s*&\s*/g, " and ")]);

  for (const [kind, headings] of Object.entries(SECTION_HEADINGS) as [Exclude<DetectedSectionKind, "custom">, string[]][]) {
    if (headings.some((h) => variants.includes(h))) return { kind, title: clean };
  }
  if (CUSTOM_HEADINGS.some((h) => variants.includes(h))) {
    return { kind: "custom", title: isAllCaps(clean) ? toTitleCase(clean) : clean };
  }
  return null;
}

export function detectHeading(line: string): DetectedHeading | null {
  const whole = matchHeading(line);
  if (whole) return { ...whole, rest: "" };

  const inline = /^([^:]{2,40}):\s*(.+)$/.exec(line);
  if (inline) {
    const prefix = matchHeading(inline[1]);
    if (prefix) return { ...prefix, rest: inline[2].trim() };
  }
  return null;
}

/** Tanınmayan ama büyük harfli kısa satırlar ("GÖNÜLLÜ ÇALIŞMALAR") — bölümler başladıktan sonra özel bölüm sayılır. */
export function looksLikeUnknownHeading(line: string): boolean {
  return isAllCaps(line) && wordCount(line) <= 4 && line.length <= 32 && !/\d/.test(line);
}

/* -------------------------------------------------------------------------- */
/*  Tarihler                                                                   */
/* -------------------------------------------------------------------------- */

const MONTHS =
  "oca|şub|sub|mar|nis|may|haz|tem|ağu|agu|eyl|eki|kas|ara|jan|feb|apr|jun|jul|aug|sep|oct|nov|dec";
const DATE = `(?:(?:${MONTHS})\\p{L}*\\.?\\s+(?:19|20)\\d{2}|\\d{1,2}[./-](?:19|20)\\d{2}|(?:19|20)\\d{2})`;
const PRESENT =
  "halen|hâlen|günümüz|günümüze|devam\\s+ediyor|şu\\s+an|hala|present|current|currently|now|today|ongoing";
const RANGE_RE = new RegExp(
  `(?<![\\p{L}\\d])(${DATE})\\s*(?:[-–—]|to|ile|until|\\s)\\s*(${DATE}|${PRESENT})(?![\\p{L}\\d])`,
  "iu",
);
const SINGLE_RE = new RegExp(`(?<![\\p{L}\\d.,])(${DATE})(?![\\p{L}\\d.,])`, "iu");
const PRESENT_RE = new RegExp(`^(?:${PRESENT})$`, "iu");

export interface FoundDate {
  start: string;
  end: string;
  current: boolean;
  /** Satırdan çıkarılacak eşleşen metin. */
  match: string;
}

/**
 * JS'in büyük/küçük harf duyarsız eşleşmesi Türkçe "İ/I" dönüşümünü yapmaz ("İLERİ", "MAYIS").
 * Eşleşme Türkçe küçültülmüş kopyada yapılır, sonuç aynı konumlardan orijinal metinden alınır.
 */
/** Türkçe ("İLERİ" → "ileri") ve İngilizce ("INTERMEDIATE" → "intermediate") küçültmeler; uzunluğu koruyanlar. */
function lowerCopies(text: string): string[] {
  return [text.toLocaleLowerCase("tr-TR"), text.toLowerCase()].filter(
    (lower, i, all) => lower.length === text.length && all.indexOf(lower) === i,
  );
}

function execTurkishInsensitive(pattern: RegExp, text: string): RegExpExecArray | null {
  for (const lower of lowerCopies(text)) {
    const match = execOnLower(pattern, text, lower);
    if (match) return match;
  }
  return pattern.exec(text);
}

function execOnLower(pattern: RegExp, text: string, lower: string): RegExpExecArray | null {
  const match = pattern.exec(lower);
  if (!match) return null;
  // Grupları orijinal metinden yeniden kur (indisler korunur).
  const original = text.slice(match.index, match.index + match[0].length);
  const groups = match.map((group) => {
    if (group === undefined) return group;
    const offset = lower.indexOf(group, match.index);
    return offset === -1 ? group : text.slice(offset, offset + group.length);
  });
  return Object.assign(groups, { index: match.index, input: text, 0: original }) as unknown as RegExpExecArray;
}

export function findDateRange(line: string): FoundDate | null {
  const range = execTurkishInsensitive(RANGE_RE, line);
  if (range) {
    const current = PRESENT_RE.test(range[2].trim().toLocaleLowerCase("tr-TR"));
    return { start: range[1].trim(), end: current ? "" : range[2].trim(), current, match: range[0] };
  }
  const single = execTurkishInsensitive(SINGLE_RE, line);
  if (single) return { start: single[1].trim(), end: "", current: false, match: single[0] };
  return null;
}

/* -------------------------------------------------------------------------- */
/*  İletişim                                                                   */
/* -------------------------------------------------------------------------- */

export const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
export const LINKEDIN_RE = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub)\/[\w%-]+\/?/i;
export const URL_RE =
  /(?:https?:\/\/[^\s|,]+|www\.[^\s|,]+|(?:github\.com|gitlab\.com|bitbucket\.org|behance\.net|dribbble\.com|medium\.com|kaggle\.com)\/[\w./%-]+)/gi;
const PHONE_RE = /\+?\(?\d[\d\s().-]{8,18}\d/g;

export function findPhone(text: string): string {
  for (const match of text.matchAll(PHONE_RE)) {
    const value = match[0].trim();
    const digits = value.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) continue;
    if (/^(?:19|20)\d{2}\s*[-–./]\s*(?:19|20)\d{2}/.test(value)) continue; // tarih aralığı
    return value;
  }
  return "";
}

export function findUrls(text: string): string[] {
  return [...text.matchAll(URL_RE)].map((m) => m[0].replace(/[),.;:]+$/, ""));
}

export function isContactLike(line: string): boolean {
  return (
    EMAIL_RE.test(line) ||
    LINKEDIN_RE.test(line) ||
    /https?:\/\/|www\./i.test(line) ||
    findUrls(line).length > 0 ||
    line.replace(/\D/g, "").length >= 7
  );
}

/* -------------------------------------------------------------------------- */
/*  Varlık ipuçları (şirket, okul, derece, konum)                              */
/* -------------------------------------------------------------------------- */

const wordRegex = (words: string[]) =>
  new RegExp(`(?<![\\p{L}])(?:${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}])`, "iu");

export const COMPANY_HINT = wordRegex([
  "a.ş.", "a.ş", "aş", "ltd", "ltd.", "şti", "şti.", "inc", "inc.", "llc", "gmbh", "corp", "corp.", "co.",
  "holding", "bank", "bankası", "teknoloji", "teknolojileri", "technologies", "technology", "yazılım",
  "software", "group", "grup", "şirketi", "solutions", "çözümleri", "limited", "ajans", "agency", "studio",
  "stüdyo", "danışmanlık", "consulting", "labs", "sanayi", "ticaret", "bilişim",
]);

export const INSTITUTION_HINT = wordRegex([
  "üniversitesi", "üniversite", "university", "lisesi", "lise", "high school", "college", "fakültesi",
  "faculty", "enstitüsü", "institute", "okulu", "school", "akademi", "akademisi", "academy",
  "meslek yüksekokulu", "myo", "koleji",
]);

export const DEGREE_HINT = wordRegex([
  "lisans", "yüksek lisans", "doktora", "ön lisans", "önlisans", "lise diploması", "bachelor", "bachelor's",
  "master", "master's", "phd", "ph.d.", "bsc", "b.sc.", "msc", "m.sc.", "b.s.", "m.s.", "b.a.", "m.a.", "mba",
  "associate", "bs", "ms", "ba", "ma",
]);

export const GPA_RE = /(?:gpa|not\s+ort\p{L}*\.?|ortalama|agno|cgpa)\s*[:=]?\s*(\d[.,]\d{1,2}(?:\s*\/\s*\d[.,]?\d{0,2})?)/iu;

const LOCATION_WORDS = [
  "istanbul", "ankara", "izmir", "bursa", "antalya", "kocaeli", "konya", "adana", "gaziantep", "eskişehir",
  "kayseri", "mersin", "samsun", "trabzon", "denizli", "sakarya", "tekirdağ", "muğla", "manisa", "diyarbakır",
  "erzurum", "malatya", "hatay", "balıkesir", "aydın", "edirne", "çanakkale", "bolu", "düzce", "uzaktan",
  "remote", "hibrit", "hybrid", "türkiye", "turkey", "türkiye.", "berlin", "london", "londra", "amsterdam",
  "münih", "munich", "dubai", "paris", "new york", "kktc", "lefkoşa",
];

export function looksLikeLocation(part: string): boolean {
  if (wordCount(part) > 5 || /\d/.test(part)) return false;
  const lower = part.toLocaleLowerCase("tr-TR");
  return LOCATION_WORDS.some((w) => new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`, "u").test(lower));
}

/* -------------------------------------------------------------------------- */
/*  Dil seviyeleri                                                             */
/* -------------------------------------------------------------------------- */

const LEVEL_KEYWORDS: [RegExp, LanguageLevel][] = [
  [/ana\s*dil|anadil|native|mother\s+tongue|bilingual/iu, "native"],
  [/(?<![\p{L}\d])c2(?![\p{L}\d])|proficient|uzman/iu, "c2"],
  [/(?<![\p{L}\d])c1(?![\p{L}\d])|advanced|ileri|fluent|akıcı/iu, "c1"],
  [/(?<![\p{L}\d])b2(?![\p{L}\d])|upper[\s-]?intermediate|orta[\s-]?(?:üstü|ileri)/iu, "b2"],
  [/(?<![\p{L}\d])b1(?![\p{L}\d])|intermediate|orta(?![\p{L}])/iu, "b1"],
  [/(?<![\p{L}\d])a2(?![\p{L}\d])|elementary|temel/iu, "a2"],
  [/(?<![\p{L}\d])a1(?![\p{L}\d])|beginner|başlangıç/iu, "a1"],
];

export function detectLanguageLevel(text: string): { level: LanguageLevel; matched: boolean } {
  const copies = [...lowerCopies(text), text];
  for (const [pattern, level] of LEVEL_KEYWORDS) {
    if (copies.some((copy) => pattern.test(copy))) return { level, matched: true };
  }
  return { level: "b1", matched: false };
}

/** Dil adını seviye ifadelerinden arındırır: "İngilizce – İleri (C1)" → "İngilizce". */
export function stripLanguageLevel(segment: string): string {
  let result = segment;
  for (const lower of lowerCopies(segment)) {
    for (const match of lower.matchAll(LEVEL_TEXT_RE)) {
      const start = match.index ?? 0;
      result = result.slice(0, start) + " ".repeat(match[0].length) + result.slice(start + match[0].length);
    }
  }
  return result === segment ? segment.replace(LEVEL_TEXT_RE, " ") : result;
}

const LEVEL_TEXT_RE =
  /\(.*?\)|(?<![\p{L}\d])[abc][12](?![\p{L}\d])|ana\s*dil|anadil|native|mother\s+tongue|bilingual|proficient|uzman|advanced|ileri|fluent|akıcı|upper[\s-]?intermediate|intermediate|orta[\s-]?(?:üstü|ileri)|orta|elementary|temel|beginner|başlangıç|seviye(?:si)?|level|[-–—:]/giu;
