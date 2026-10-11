import { paginate, PRINT_GEOMETRY, resetPushes } from "@/lib/resume/pagination";

const PRINT_ROOT_ID = "print-root";
const MEASURING_CLASS = "print-measuring";
const PAGE_BREAK_ATTR = "data-page-break";

/**
 * Seçili CV yazı tipinin normal, kalın ve italik kesimlerinin yüklendiğinden emin olur.
 * Önizleme gizliyken (ör. mobilde "Düzenle" sekmesi) tarayıcı yazı tipini henüz
 * indirmemiş olabilir; beklemezsek PDF yedek yazı tipiyle çıkar.
 */
async function ensureResumeFontsLoaded(root: HTMLElement): Promise<void> {
  if (!("fonts" in document)) return;
  const article = root.querySelector("article");
  const family = article ? getComputedStyle(article).fontFamily : "";
  if (family) {
    await Promise.allSettled(
      ["400 12pt", "700 12pt", "italic 400 12pt"].map((spec) => document.fonts.load(`${spec} ${family}`, "ğüşıöçĞÜŞİÖÇ")),
    );
  }
  await document.fonts.ready;
}

/**
 * Sayfa sonlarını önizlemeyle aynı algoritmayla (lib/resume/pagination.ts) baskı
 * düzeninde hesaplar ve açık sayfa sonu olarak işaretler. Tarayıcının kendi
 * "bölme" sezgilerine bırakmak önizlemeyle farklı ve kötü sonuçlar veriyordu.
 */
function markPageBreaks(root: HTMLElement): void {
  const article = root.querySelector<HTMLElement>("article");
  if (!article) return;
  article.querySelectorAll(`[${PAGE_BREAK_ATTR}]`).forEach((el) => el.removeAttribute(PAGE_BREAK_ATTR));

  root.classList.add(MEASURING_CLASS);
  try {
    const { movedToNextPage } = paginate(article, PRINT_GEOMETRY);
    resetPushes(article);
    movedToNextPage.forEach((el) => el.setAttribute(PAGE_BREAK_ATTR, ""));
  } finally {
    root.classList.remove(MEASURING_CLASS);
  }
}

/**
 * Tarayıcının yerleşik PDF motoru ile çıktı alır. `@media print` stilleri
 * (globals.css) yalnızca #print-root içindeki CV'yi görünür bırakır; sonuç,
 * ATS'lerin sorunsuz okuyabildiği gerçek, seçilebilir bir metin katmanıdır.
 *
 * Belge başlığı geçici olarak değiştirilir çünkü tarayıcılar PDF dosya adını
 * document.title'dan türetir.
 */
export async function printResume(fileName: string): Promise<void> {
  const root = document.getElementById(PRINT_ROOT_ID);
  if (root) {
    await ensureResumeFontsLoaded(root);
    markPageBreaks(root);
  }

  const previousTitle = document.title;
  document.title = fileName;

  const restore = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}
