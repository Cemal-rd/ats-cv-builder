// PDF.js worker'ını public/ altına kopyalar. Worker'ı webpack'e paketletmek yerine
// statik dosya olarak sunmak, minify sırasında bozulmasını ve basePath sorunlarını önler.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";

const source = "node_modules/pdfjs-dist/build/pdf.worker.min.mjs";
const target = "public/pdf.worker.min.mjs";

if (!existsSync(source)) {
  console.error(`[copy-pdf-worker] Bulunamadı: ${source}. "npm install" çalıştırıldı mı?`);
  process.exit(1);
}
mkdirSync("public", { recursive: true });
copyFileSync(source, target);
console.log(`[copy-pdf-worker] ${target} hazır.`);
