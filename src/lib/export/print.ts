import { CONTENT_HEIGHT_PX, KEEP_TOGETHER_ATTR } from "@/lib/resume/pagination";

const PRINT_ROOT_ID = "print-root";
const MEASURING_CLASS = "print-measuring";

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
 * Bir sayfaya sığan bölümleri "bölünmez" olarak işaretler. Bu kural uzun bölümlere
 * uygulanırsa tarayıcı bölümü önce yeni sayfaya iter ve önceki sayfa boş kalır;
 * CSS yükseklik bilemediği için ölçüm burada, baskı düzeninde yapılır.
 */
function markKeepTogetherSections(root: HTMLElement): void {
  root.classList.add(MEASURING_CLASS);
  try {
    root.querySelectorAll<HTMLElement>(".resume-page > section").forEach((section) => {
      section.toggleAttribute(KEEP_TOGETHER_ATTR, section.offsetHeight <= CONTENT_HEIGHT_PX);
    });
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
    markKeepTogetherSections(root);
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
