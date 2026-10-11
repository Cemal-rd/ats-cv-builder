/**
 * Tarayıcının yerleşik PDF motoru ile çıktı alır. `@media print` stilleri
 * (globals.css) yalnızca #print-root içindeki CV'yi görünür bırakır; sonuç,
 * ATS'lerin sorunsuz okuyabildiği gerçek, seçilebilir bir metin katmanıdır.
 *
 * Belge başlığı geçici olarak değiştirilir çünkü tarayıcılar PDF dosya adını
 * document.title'dan türetir.
 */
export function printResume(fileName: string): void {
  const previousTitle = document.title;
  document.title = fileName;

  const restore = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}
