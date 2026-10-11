const PRINT_ROOT_ID = "print-root";

/**
 * Seçili CV yazı tipinin normal, kalın ve italik kesimlerinin yüklendiğinden emin olur.
 * Önizleme gizliyken (ör. mobilde "Düzenle" sekmesi) tarayıcı yazı tipini henüz
 * indirmemiş olabilir; beklemezsek PDF yedek yazı tipiyle çıkar.
 */
async function ensureResumeFontsLoaded(): Promise<void> {
  if (!("fonts" in document)) return;
  const article = document.getElementById(PRINT_ROOT_ID)?.querySelector("article");
  const family = article ? getComputedStyle(article).fontFamily : "";
  if (family) {
    await Promise.allSettled(
      ["400 12pt", "700 12pt", "italic 400 12pt"].map((spec) => document.fonts.load(`${spec} ${family}`, "ğüşıöçĞÜŞİÖÇ")),
    );
  }
  await document.fonts.ready;
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
  await ensureResumeFontsLoaded();

  const previousTitle = document.title;
  document.title = fileName;

  const restore = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}
