/**
 * Önizleme için sayfalama simülasyonu. Yazdırmadaki CSS kurallarının (globals.css → @media print)
 * aynısını uygular, böylece önizlemede görülen sayfa sonları PDF'tekiyle örtüşür:
 *
 *  - Bir sayfaya sığan bölüm bölünmez; sığmıyorsa başlığıyla birlikte sonraki sayfaya geçer.
 *  - Bir sayfadan uzun bölüm kayıtlar arasından bölünür; başlık ilk kayıtla birlikte kalır.
 *  - Kayıtlar (bir iş deneyimi, bir okul…) bölünmez.
 *
 * Kaydırma, ilgili öğeye margin-top eklenerek yapılır. Ölçümler kesirli piksellerle
 * (getBoundingClientRect) alınır ve önizleme ölçeğine bölünür: tam sayıya yuvarlanan
 * offsetTop/offsetHeight, sınırdaki bölümlerde baskıyla 1 px'lik sapma yaratıyordu.
 */

/** Baskı motoruyla aradaki alt-piksel farklarına tolerans. */
const EPSILON_PX = 0.5;

const PX_PER_MM = 96 / 25.4;
export const PAGE_HEIGHT_PX = 297 * PX_PER_MM;
/** @page üst/alt kenar boşluğu (globals.css ile aynı olmalı). */
const PAGE_MARGIN_PX = 16 * PX_PER_MM;
export const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - 2 * PAGE_MARGIN_PX;

/** Yazdırmada bölünmeden tutulacak (bir sayfaya sığan) bölümleri işaretleyen öznitelik; bkz. globals.css. */
export const KEEP_TOGETHER_ATTR = "data-keep-together";

const PUSH_ATTR = "data-page-push";

interface Unit {
  /** Kaydırılacak öğe (margin-top eklenir). */
  push: HTMLElement;
  /** Birlikte tutulacak aralığın ilk ve son öğesi. */
  start: HTMLElement;
  end: HTMLElement;
}

/** Sayfalamayı uygular ve toplam sayfa sayısını döndürür. */
export function paginate(article: HTMLElement): number {
  resetPushes(article);

  // Önizleme transform: scale(...) ile küçültülür; ölçümleri ölçeksiz piksele çevir.
  const scale = article.getBoundingClientRect().width / article.offsetWidth || 1;
  const origin = () => article.getBoundingClientRect().top;
  const top = (el: HTMLElement) => (el.getBoundingClientRect().top - origin()) / scale;
  const bottom = (el: HTMLElement) => (el.getBoundingClientRect().bottom - origin()) / scale;
  const pageStart = (page: number) => page * PAGE_HEIGHT_PX + PAGE_MARGIN_PX;
  const pageEnd = (page: number) => pageStart(page) + CONTENT_HEIGHT_PX;

  let page = 0;
  let lastBottom = 0;

  for (const unit of collectUnits(article)) {
    const unitTop = top(unit.start);
    while (unitTop >= pageStart(page + 1) - EPSILON_PX) page++;

    const height = bottom(unit.end) - unitTop;
    if (
      bottom(unit.end) > pageEnd(page) + EPSILON_PX &&
      height <= CONTENT_HEIGHT_PX &&
      unitTop > pageStart(page) + EPSILON_PX
    ) {
      const shift = pageStart(page + 1) - unitTop;
      const currentMargin = parseFloat(getComputedStyle(unit.push).marginTop) || 0;
      unit.push.style.marginTop = `${currentMargin + shift}px`;
      unit.push.setAttribute(PUSH_ATTR, "");
      page++;
    }
    lastBottom = Math.max(lastBottom, bottom(unit.end));
  }

  return Math.max(1, Math.floor((lastBottom - EPSILON_PX) / PAGE_HEIGHT_PX) + 1);
}

function resetPushes(article: HTMLElement) {
  article.querySelectorAll<HTMLElement>(`[${PUSH_ATTR}]`).forEach((el) => {
    el.style.marginTop = "";
    el.removeAttribute(PUSH_ATTR);
  });
}

/** Belgeyi "bölünmeyecek birimlere" ayırır. */
function collectUnits(article: HTMLElement): Unit[] {
  const units: Unit[] = [];

  for (const child of Array.from(article.children) as HTMLElement[]) {
    if (child.tagName !== "SECTION") {
      units.push({ push: child, start: child, end: child });
      continue;
    }

    // Sayfaya sığan bölüm: tek parça.
    if (child.offsetHeight <= CONTENT_HEIGHT_PX) {
      units.push({ push: child, start: child, end: child });
      continue;
    }

    // Uzun bölüm: başlık + ilk kayıt birlikte, sonra her kayıt ayrı.
    const body = child.querySelector<HTMLElement>(":scope > div");
    const entries = body ? (Array.from(body.children) as HTMLElement[]) : [];
    if (entries.length === 0) {
      units.push({ push: child, start: child, end: child });
      continue;
    }
    units.push({ push: child, start: child, end: entries[0] });
    for (const entry of entries.slice(1)) units.push({ push: entry, start: entry, end: entry });
  }
  return units;
}
