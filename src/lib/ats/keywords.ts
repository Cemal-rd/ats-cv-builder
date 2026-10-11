/**
 * İstemci tarafı, basit bir anahtar kelime eşleştirici.
 * İlan metnindeki terimleri frekans + "teknik terim" sezgileriyle sıralar,
 * ardından CV düz metninde arar. (İleride NLP/LLM tabanlı bir servisle değiştirilebilir.)
 */

const STOPWORDS = new Set([
  // EN
  "a", "about", "above", "across", "after", "all", "also", "an", "and", "any", "are", "as", "at", "be",
  "been", "being", "both", "but", "by", "can", "could", "do", "does", "each", "etc", "for", "from", "has",
  "have", "having", "how", "if", "in", "into", "is", "it", "its", "may", "more", "most", "must", "new",
  "no", "not", "of", "on", "or", "our", "other", "over", "per", "plus", "should", "so", "some", "such",
  "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "through",
  "to", "up", "us", "using", "via", "was", "we", "well", "were", "what", "when", "where", "which",
  "while", "who", "will", "with", "within", "would", "you", "your",
  "ability", "candidate", "candidates", "company", "experience", "experienced", "excellent", "good",
  "great", "ideal", "including", "job", "join", "knowledge", "looking", "minimum", "preferred",
  "position", "proven", "required", "requirements", "responsibilities", "role", "skills", "strong",
  "team", "understanding", "work", "working", "year", "years", "familiarity", "familiar", "opportunity",
  // TR
  "ve", "veya", "ile", "için", "bir", "bu", "şu", "da", "de", "ki", "mi", "olan", "olarak", "gibi",
  "en", "az", "çok", "daha", "her", "tüm", "ise", "ya", "hem", "ama", "fakat", "kadar", "üzere",
  "olmak", "olması", "sahip", "konusunda", "konularında", "alanında", "tercihen", "tercih", "sebebidir",
  "nedenidir", "aday", "adaylar", "arıyoruz", "aranan", "aranıyor", "nitelikler", "nitelikli", "görev",
  "görevler", "sorumluluklar", "iş", "tanımı", "pozisyon", "şirket", "şirketimiz", "ekip", "ekibimize",
  "ekibine", "deneyim", "deneyimli", "deneyimi", "tecrübe", "tecrübeli", "yıl", "yıllık", "iyi",
  "güçlü", "bilgi", "bilgisi", "bilgili", "yetkin", "yetkinlik", "olmalı", "olan", "eden", "edebilen",
  "yapabilen", "çalışma", "çalışan", "çalışacak", "katılacak", "minimum", "en az", "üniversitelerin",
  "bölümlerinden", "mezun", "tam", "zamanlı", "vb", "vs", "bilen", "bilmek", "yazma", "yapma",
  "kullanma", "kullanabilen", "hakim", "hâkim", "sahibi", "becerisi", "becerileri", "yeteneği",
]);

const TOKEN_PATTERN = /[\p{L}\p{N}][\p{L}\p{N}+#.]*[\p{L}\p{N}+#]|[\p{L}\p{N}]/gu;
const NUMERIC = /^\d+(?:[.,]\d+)?$/;

export interface KeywordHit {
  term: string;
  matched: boolean;
}

export interface KeywordMatchResult {
  keywords: KeywordHit[];
  matchedCount: number;
  percentage: number;
}

export function normalizeText(text: string): string {
  return text.replace(/İ/g, "i").toLowerCase().normalize("NFC");
}

interface Token {
  raw: string;
  norm: string;
}

function tokenize(text: string): Token[] {
  return (text.match(TOKEN_PATTERN) ?? []).map((raw) => ({ raw, norm: normalizeText(raw) }));
}

const isCandidate = (token: string) => token.length >= 2 && !STOPWORDS.has(token) && !NUMERIC.test(token);

/** "TypeScript", "AWS", "C#", "node.js" gibi terimler sıralamada öne çıkar. */
function technicalBonus(raw: string): number {
  if (/[+#.]/.test(raw) || /\d/.test(raw)) return 0.6;
  if (/\p{Lu}/u.test(raw.slice(1))) return 0.6;
  if (/^\p{Lu}/u.test(raw)) return 0.3;
  return 0;
}

export function extractKeywords(text: string, limit = 25): string[] {
  const tokens = tokenize(text);
  const scores = new Map<string, number>();
  const bigramCounts = new Map<string, number>();
  const firstSeen = new Map<string, number>();

  const bump = (term: string, weight: number, position: number) => {
    scores.set(term, (scores.get(term) ?? 0) + weight);
    if (!firstSeen.has(term)) firstSeen.set(term, position);
  };

  tokens.forEach((token, i) => {
    if (!isCandidate(token.norm)) return;
    bump(token.norm, 1 + technicalBonus(token.raw), i);
    const next = tokens[i + 1];
    if (next && isCandidate(next.norm)) {
      const bigram = `${token.norm} ${next.norm}`;
      bigramCounts.set(bigram, (bigramCounts.get(bigram) ?? 0) + 1);
      if (!firstSeen.has(bigram)) firstSeen.set(bigram, i);
    }
  });

  // Yalnızca tekrar eden ikili ifadeler anlamlı kabul edilir ("project management").
  bigramCounts.forEach((count, bigram) => {
    if (count >= 2) scores.set(bigram, count * 1.5);
  });

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || (firstSeen.get(a[0]) ?? 0) - (firstSeen.get(b[0]) ?? 0))
    .slice(0, limit)
    .map(([term]) => term);
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Türkçe ekleri tolere eder: "yönetim" → "yönetimi", "python" → "python'da". */
export function containsTerm(haystack: string, term: string): boolean {
  const body = escapeRegExp(term).replace(/\s+/g, "\\s+");
  const allowSuffix = term.length >= 6 && /^[\p{L}\s]+$/u.test(term);
  const suffix = allowSuffix ? "\\p{L}{0,5}" : "";
  return new RegExp(`(?<![\\p{L}\\p{N}])${body}${suffix}(?![\\p{L}\\p{N}])`, "u").test(haystack);
}

export function matchKeywords(jobDescription: string, resumeText: string, limit = 25): KeywordMatchResult {
  const haystack = normalizeText(resumeText);
  const keywords = extractKeywords(jobDescription, limit).map((term) => ({
    term,
    matched: containsTerm(haystack, term),
  }));
  const matchedCount = keywords.filter((k) => k.matched).length;
  return {
    keywords,
    matchedCount,
    percentage: keywords.length ? Math.round((matchedCount / keywords.length) * 100) : 0,
  };
}
