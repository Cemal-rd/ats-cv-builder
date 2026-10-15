import { en } from "./messages/en";
import { tr, type Messages } from "./messages/tr";

export type { Messages };

/** Arayüz dili. CV'nin dili (ResumeLocale) bundan bağımsızdır: Türkçe arayüzle İngilizce CV yazılabilir. */
export const UI_LOCALES = ["tr", "en"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

export const MESSAGES: Record<UiLocale, Messages> = { tr, en };

/** Kullanıcının açıkça seçtiği arayüz dili (TR/EN düğmesi) burada hatırlanır. */
export const UI_LOCALE_STORAGE_KEY = "ats-cv-builder:ui-locale";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Sayfa adresleri: Türkçe kökte, İngilizce /en/ altında. */
export const uiLocalePath = (locale: UiLocale) => `${BASE_PATH}${locale === "en" ? "/en/" : "/"}`;

/** Tarayıcıda hangi dil sayfasında olduğumuzu adresten okur (store'un ilk değeri için). */
export function detectUiLocaleFromPath(): UiLocale {
  if (typeof window === "undefined") return "tr";
  const path = window.location.pathname.slice(BASE_PATH.length);
  return /^\/en(\/|$)/.test(path) ? "en" : "tr";
}
