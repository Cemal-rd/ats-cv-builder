"use client";

import { createContext, useContext, useEffect } from "react";
import { MESSAGES, type Messages, type UiLocale } from "./index";

interface I18nValue {
  locale: UiLocale;
  t: Messages;
}

const I18nContext = createContext<I18nValue>({ locale: "tr", t: MESSAGES.tr });

export function I18nProvider({ locale, children }: { locale: UiLocale; children: React.ReactNode }) {
  // Kök layout <html lang="tr"> ile gelir; İngilizce sayfada belge dilini düzelt
  // (ekran okuyucular, yazım denetimi ve tarayıcı çevirisi için).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <I18nContext.Provider value={{ locale, t: MESSAGES[locale] }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
