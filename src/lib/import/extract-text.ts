/**
 * Yüklenen CV dosyasından düz metin çıkarır. Tamamen tarayıcıda çalışır;
 * dosya hiçbir sunucuya gönderilmez. Kütüphaneler yalnızca gerektiğinde yüklenir.
 */

export type ImportFileKind = "pdf" | "docx" | "txt";

export interface ExtractedText {
  text: string;
  warnings: string[];
}

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
export const IMPORT_ACCEPT = ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

export class ImportError extends Error {}

export function detectFileKind(file: File): ImportFileKind | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") return "pdf";
  if (name.endsWith(".docx")) return "docx";
  if (name.endsWith(".txt") || file.type === "text/plain") return "txt";
  return null;
}

export async function extractTextFromFile(file: File): Promise<ExtractedText> {
  const kind = detectFileKind(file);
  if (!kind) {
    const isLegacyWord = file.name.toLowerCase().endsWith(".doc");
    throw new ImportError(
      isLegacyWord
        ? "Eski Word formatı (.doc) desteklenmiyor. Word'de \"Farklı Kaydet → .docx\" ile kaydedip tekrar deneyin."
        : "Desteklenmeyen dosya türü. PDF, DOCX veya TXT yükleyin.",
    );
  }
  if (file.size > MAX_IMPORT_BYTES) throw new ImportError("Dosya 10 MB'tan büyük olamaz.");

  const buffer = await file.arrayBuffer();
  switch (kind) {
    case "pdf":
      return extractPdfText(buffer);
    case "docx":
      return { text: await extractDocxText(buffer), warnings: [] };
    case "txt":
      return { text: new TextDecoder("utf-8").decode(buffer), warnings: [] };
  }
}

/* -------------------------------------------------------------------------- */
/*  PDF                                                                        */
/* -------------------------------------------------------------------------- */

interface PdfTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

interface PdfRow {
  y: number;
  height: number;
  parts: { x: number; width: number; str: string }[];
}

/** Bir satırda bu kadar (yazı yüksekliği cinsinden) boşluk varsa ayrı sütun/hücre sayılır. */
const COLUMN_GAP_RATIO = 2.5;

async function extractPdfText(buffer: ArrayBuffer): Promise<ExtractedText> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/pdf.worker.min.mjs`;

  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    throw new ImportError(
      name === "PasswordException"
        ? "PDF şifreli. Şifresiz bir kopyasını yükleyin."
        : "PDF okunamadı. Dosya bozuk olabilir.",
    );
  }

  try {
    const pages: string[] = [];
    let rowCount = 0;
    let gappedRowCount = 0;

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      const items = content.items.flatMap((item) => ("str" in item ? [item as PdfTextItem] : []));
      const { text, rows, gappedRows } = itemsToText(items);
      pages.push(text);
      rowCount += rows;
      gappedRowCount += gappedRows;
      page.cleanup();
    }

    const warnings: string[] = [];
    if (rowCount >= 15 && gappedRowCount / rowCount > 0.35) {
      warnings.push(
        "İki sütunlu bir düzen algılandı. ATS sistemleri bu tür CV'lerde metni karışık sırayla okuyabilir; bazı alanlar yanlış yere düşmüş olabilir.",
      );
    }
    return { text: pages.join("\n"), warnings };
  } finally {
    await doc.destroy();
  }
}

/** PDF metin parçalarını konumlarına göre satırlara dizer (PDF'te "satır" kavramı yoktur). */
function itemsToText(items: PdfTextItem[]) {
  const rows: PdfRow[] = [];

  for (const item of items) {
    if (!item.str.trim()) continue;
    const x = item.transform[4];
    const y = item.transform[5];
    const height = item.height || Math.abs(item.transform[3]) || 10;
    const row = rows.find((r) => Math.abs(r.y - y) <= Math.max(2, Math.min(r.height, height) * 0.5));
    const part = { x, width: item.width, str: item.str };
    if (row) {
      row.parts.push(part);
      row.height = Math.max(row.height, height);
    } else {
      rows.push({ y, height, parts: [part] });
    }
  }

  rows.sort((a, b) => b.y - a.y);
  let gappedRows = 0;

  const lines = rows.map((row) => {
    row.parts.sort((a, b) => a.x - b.x);
    let line = "";
    let previousEnd = 0;
    let hasGap = false;
    for (const part of row.parts) {
      const gap = part.x - previousEnd;
      if (line) {
        if (gap > row.height * COLUMN_GAP_RATIO) {
          line += " | ";
          hasGap = true;
        } else if (gap > row.height * 0.15 && !line.endsWith(" ") && !part.str.startsWith(" ")) {
          line += " ";
        }
      }
      line += part.str;
      previousEnd = part.x + part.width;
    }
    if (hasGap) gappedRows++;
    return line.replace(/\s+/g, " ").trim();
  });

  return { text: lines.filter(Boolean).join("\n"), rows: rows.length, gappedRows };
}

/* -------------------------------------------------------------------------- */
/*  DOCX                                                                       */
/* -------------------------------------------------------------------------- */

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const mod = await import("mammoth/mammoth.browser");
  const mammoth = mod.default ?? mod;
  let html: string;
  try {
    html = (await mammoth.convertToHtml({ arrayBuffer: buffer })).value;
  } catch {
    throw new ImportError("Word dosyası okunamadı. Dosya bozuk olabilir.");
  }
  return htmlToText(html);
}

/**
 * Ham metin yerine HTML üzerinden gidilir: liste öğeleri madde işaretini
 * kaybetmesin ("• " öneki) ve tablo hücreleri ayrı parçalar olarak kalsın.
 */
function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html.replace(/<br\s*\/?>/gi, "\n"), "text/html");
  const lines: string[] = [];
  const text = (el: Element) => (el.textContent ?? "").replace(/[ \t]+/g, " ").trim();

  const walk = (parent: Element) => {
    for (const el of Array.from(parent.children)) {
      const tag = el.tagName;
      if (tag === "LI") {
        const own = el.cloneNode(true) as Element;
        own.querySelectorAll("ul,ol").forEach((nested) => nested.remove());
        const value = text(own);
        if (value) lines.push(`• ${value}`);
        el.querySelectorAll(":scope > ul, :scope > ol").forEach(walk);
      } else if (/^(P|H[1-6])$/.test(tag)) {
        lines.push(...text(el).split("\n"));
      } else if (tag === "TABLE") {
        el.querySelectorAll("tr").forEach((row) => {
          const cells = Array.from(row.querySelectorAll("td,th")).map(text).filter(Boolean);
          if (cells.length) lines.push(...cells.join(" | ").split("\n"));
        });
      } else {
        walk(el);
      }
    }
  };

  walk(doc.body);
  return lines.map((line) => line.trim()).filter(Boolean).join("\n");
}
