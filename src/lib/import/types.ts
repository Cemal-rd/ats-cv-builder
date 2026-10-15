import type { Messages } from "@/i18n";

/** İçe aktarma hataları kod olarak taşınır; metni arayüz kendi dilinde gösterir. */
export type ImportErrorCode = keyof Messages["import"]["errors"];

export class ImportError extends Error {
  constructor(public readonly code: ImportErrorCode) {
    super(code);
    this.name = "ImportError";
  }
}

/** Kontrol ekranında gösterilen uyarılar (metinleri: i18n → import.warnings). */
export type ImportWarning =
  | { code: "twoColumn" }
  | { code: "lowText" }
  | { code: "noHeadings" }
  | { code: "clipped"; count: number; examples: string };
