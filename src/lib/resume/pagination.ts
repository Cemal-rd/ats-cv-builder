/**
 * Sayfa sonu hesabı — hem önizleme hem PDF aynı algoritmayı kullanır, böylece
 * önizlemede görülen sayfa sonları PDF'tekiyle örtüşür.
 *
 * Kurallar (doğal akış esas; yalnızca kötü bölünmeler engellenir):
 *  1. Sayfa sonuna az yer kalmışsa, oraya denk gelen bölüm başlığıyla birlikte yeni
 *     sayfaya geçer — yeni sayfa başlıkla başlar.
 *  2. Çok yer kalmışsa sayfa boşa harcanmaz: bölüm akar ve kayıtların (iş, okul…)
 *     ARASINDAN bölünür; bir kaydın maddeleri iki sayfaya ayrılmaz.
 *  3. Bölüm başlığı sayfa dibinde tek başına kalmaz (en az ilk kayıtla birlikte durur).
 *
 * Ölçümler kesirli piksellerle (getBoundingClientRect) yapılır ve önizleme ölçeğine
 * bölünür; tam sayıya yuvarlanan offset değerleri sınırda 1 px sapma yaratıyordu.
 */

const PX_PER_MM = 96 / 25.4;
export const PAGE_HEIGHT_PX = 297 * PX_PER_MM;
/** @page üst/alt kenar boşluğu (globals.css ile aynı olmalı). */
const PAGE_MARGIN_PX = 16 * PX_PER_MM;
/**
 * Güvenlik payı: sayfaya kıl payı (<1 px) sığan içerik, baskı motorunun küçük ölçüm
 * farklarıyla taşıp başlığı sayfa dibinde yalnız bırakabiliyordu. Sınırdaki öğeler
 * hem önizlemede hem PDF'te kararlı biçimde sonraki sayfaya alınır.
 */
const SAFETY_PX = 2;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - 2 * PAGE_MARGIN_PX - SAFETY_PX;

/** Bölüm, kalan alan sayfanın bu oranından azsa bütün olarak yeni sayfaya taşınır. */
const SECTION_MOVE_RATIO = 0.3;
/** Baskı motoruyla aradaki alt-piksel farklarına tolerans. */
const EPSILON_PX = 0.5;

const PUSH_ATTR = "data-page-push";

export interface PageGeometry {
  /** k. sayfanın içerik alanının başladığı y koordinatı (makale içinde). */
  pageStart: (page: number) => number;
  contentHeight: number;
}

/** Önizleme: sayfalar alt alta kâğıt gibi dizilir, her sayfada üst/alt kenar boşluğu vardır. */
export const PREVIEW_GEOMETRY: PageGeometry = {
  pageStart: (page) => page * PAGE_HEIGHT_PX + PAGE_MARGIN_PX,
  contentHeight: CONTENT_HEIGHT_PX,
};

/** Baskı ölçümü: kenar boşlukları @page'de olduğu için içerik alanları art arda gelir. */
export const PRINT_GEOMETRY: PageGeometry = {
  pageStart: (page) => page * (CONTENT_HEIGHT_PX + SAFETY_PX),
  contentHeight: CONTENT_HEIGHT_PX,
};

export interface PaginationResult {
  pageCount: number;
  /** Yeni sayfaya taşınan öğeler (margin-top ile kaydırılmış hâlde bırakılır). */
  movedToNextPage: HTMLElement[];
}

export function paginate(article: HTMLElement, geometry: PageGeometry = PREVIEW_GEOMETRY): PaginationResult {
  resetPushes(article);

  const scale = article.getBoundingClientRect().width / article.offsetWidth || 1;
  const origin = () => article.getBoundingClientRect().top;
  const top = (el: Element) => (el.getBoundingClientRect().top - origin()) / scale;
  const bottom = (el: Element) => (el.getBoundingClientRect().bottom - origin()) / scale;

  const { pageStart, contentHeight } = geometry;
  const moved: HTMLElement[] = [];
  let page = 0;
  let lastBottom = 0;

  const pageOf = (y: number) => {
    let p = 0;
    while (y >= pageStart(p + 1) - EPSILON_PX) p++;
    return p;
  };
  const pageEnd = () => pageStart(page) + contentHeight;
  const moveToNextPage = (el: HTMLElement, elTop: number) => {
    const currentMargin = parseFloat(getComputedStyle(el).marginTop) || 0;
    el.style.marginTop = `${currentMargin + pageStart(page + 1) - elTop}px`;
    el.setAttribute(PUSH_ATTR, "");
    moved.push(el);
    page++;
  };

  /** start..end aralığını bölünmez kabul eder; sayfa sonunu aşarsa (ve sayfaya sığıyorsa) taşır. */
  const keepTogether = (push: HTMLElement, start: Element, end: Element) => {
    const t = top(start);
    page = Math.max(page, pageOf(t));
    const b = bottom(end);
    if (b > pageEnd() + EPSILON_PX && b - t <= contentHeight && t > pageStart(page) + EPSILON_PX) {
      moveToNextPage(push, t);
    }
    lastBottom = Math.max(lastBottom, bottom(end));
  };

  for (const child of Array.from(article.children) as HTMLElement[]) {
    if (child.tagName !== "SECTION") {
      keepTogether(child, child, child);
      continue;
    }

    const t = top(child);
    page = Math.max(page, pageOf(t));
    const b = bottom(child);

    if (b <= pageEnd() + EPSILON_PX) {
      lastBottom = Math.max(lastBottom, b);
      continue;
    }

    // Kural 1: kalan alan azsa ve bölüm tek sayfaya sığıyorsa, bütün bölüm yeni sayfaya.
    const remaining = pageEnd() - t;
    if (b - t <= contentHeight && remaining <= contentHeight * SECTION_MOVE_RATIO && t > pageStart(page) + EPSILON_PX) {
      moveToNextPage(child, t);
      lastBottom = Math.max(lastBottom, bottom(child));
      continue;
    }

    // Kural 2 ve 3: kayıtlar arasından böl; başlık ilk kayıtla birlikte kalır.
    const entries = Array.from(child.querySelector(":scope > div")?.children ?? []) as HTMLElement[];
    if (entries.length === 0) {
      keepTogether(child, child, child);
      continue;
    }
    keepTogether(child, child, entries[0]);
    for (const entry of entries.slice(1)) keepTogether(entry, entry, entry);
  }

  return { pageCount: pageOf(lastBottom - EPSILON_PX) + 1, movedToNextPage: moved };
}

export function resetPushes(article: HTMLElement) {
  article.querySelectorAll<HTMLElement>(`[${PUSH_ATTR}]`).forEach((el) => {
    el.style.marginTop = "";
    el.removeAttribute(PUSH_ATTR);
  });
}
