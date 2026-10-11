/**
 * İngilizce maddeler fiille BAŞLAR ("Led a team…"),
 * Türkçe maddeler fiille BİTER ("…ekibi yönettim.").
 * Bu yüzden iki dil ayrı stratejiyle kontrol edilir.
 */

const EN_ACTION_VERBS = new Set([
  "achieved", "accelerated", "administered", "analyzed", "architected", "authored", "automated",
  "boosted", "built", "championed", "coached", "collaborated", "conducted", "consolidated",
  "coordinated", "created", "cut", "decreased", "defined", "delivered", "deployed", "designed",
  "developed", "directed", "drove", "eliminated", "enabled", "engineered", "established",
  "executed", "expanded", "facilitated", "generated", "grew", "headed", "identified",
  "implemented", "improved", "increased", "initiated", "integrated", "introduced", "launched",
  "led", "maintained", "managed", "mentored", "migrated", "modernized", "negotiated",
  "optimized", "orchestrated", "organized", "oversaw", "pioneered", "planned", "produced",
  "programmed", "redesigned", "reduced", "refactored", "resolved", "restructured", "revamped",
  "saved", "scaled", "secured", "shipped", "simplified", "sold", "spearheaded", "streamlined",
  "strengthened", "supervised", "taught", "trained", "transformed", "upgraded", "won", "wrote",
]);

const TR_ACTION_STEMS = [
  "geliştir", "yönet", "tasarla", "oluştur", "kur", "uygula", "geçir", "başlat", "azalt",
  "artır", "arttır", "iyileştir", "optimize", "otomatikleştir", "dönüştür", "entegre",
  "koordine", "planla", "organize", "analiz", "raporla", "eğit", "yürüt", "sağla", "tamamla",
  "teslim", "düşür", "büyüt", "kazandır", "kazan", "hızlandır", "modernize", "taşı", "yaz",
  "çöz", "belirle", "tanımla", "denetle", "müzakere", "hazırla", "ölçeklendir", "kurgula",
  "yapılandır", "standartlaştır", "sadeleştir", "yenile", "devret", "başar", "üret", "et", "ed",
];

/** Geçmiş / şimdiki zaman çekimli fiil soneki (geliştirdim, yönettik, yürütüyorum…) */
const TR_VERB_SUFFIX = /(?:[dt][ıiuü](?:m|k|n|nız|niz|nuz|nüz|lar|ler)?|yor(?:um|uz)?|mıştır|miştir|muştur|müştür)$/u;

export const WEAK_PHRASES = [
  "sorumlu", "sorumluydum", "görev aldım", "yardımcı oldum", "çalıştım", "ilgilendim",
  "responsible for", "worked on", "helped", "assisted", "duties included", "tasked with",
];

const stripPunctuation = (word: string) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

function startsWithEnglishVerb(bullet: string): boolean {
  const first = stripPunctuation(bullet.trim().split(/\s+/)[0] ?? "").toLowerCase();
  if (!first) return false;
  const candidates = [first, `${first}ed`, `${first}d`, first.replace(/y$/, "ied"), first.replace(/s$/, "ed")];
  return candidates.some((c) => EN_ACTION_VERBS.has(c));
}

function endsWithTurkishVerb(bullet: string): boolean {
  const words = bullet.trim().split(/\s+/);
  const last = stripPunctuation(words[words.length - 1] ?? "").toLocaleLowerCase("tr-TR");
  if (!last || !TR_VERB_SUFFIX.test(last)) return false;
  return TR_ACTION_STEMS.some((stem) => last.startsWith(stem));
}

export function hasActionVerb(bullet: string): boolean {
  return startsWithEnglishVerb(bullet) || endsWithTurkishVerb(bullet);
}

export function findWeakPhrase(bullet: string): string | undefined {
  const normalized = bullet.toLocaleLowerCase("tr-TR");
  return WEAK_PHRASES.find((phrase) => normalized.includes(phrase));
}
