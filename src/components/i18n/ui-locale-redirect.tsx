"use client";

import { useEffect, useState } from "react";
import { UI_LOCALE_STORAGE_KEY, uiLocalePath } from "@/i18n";

/**
 * Yalnızca Türkçe (kök) sayfada kullanılır: kullanıcı daha önce EN'yi seçtiyse ya da
 * hiç seçim yapmamış ve tarayıcı dili Türkçe değilse /en/ sayfasına yönlendirir.
 * Açık seçim her zaman otomatik algılamadan önce gelir; TR'yi seçen burada kalır.
 * Karar verilene kadar içerik render edilmez: aksi hâlde builder yüklenip Türkçe
 * örnek CV'yi kaydedebilir ve İngilizce sayfada John Doe yerine o görünürdü.
 */
export function UiLocaleRedirect({ children }: { children: React.ReactNode }) {
  const [stay, setStay] = useState(false);

  useEffect(() => {
    let preference: string | null = null;
    try {
      preference = localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    } catch {
      // Depolama kapalıysa yalnızca tarayıcı diline bakılır.
    }
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    const prefersEnglish = preference === "en" || (preference === null && !languages.some((lang) => /^tr\b/i.test(lang)));
    if (prefersEnglish) window.location.replace(uiLocalePath("en") + window.location.search + window.location.hash);
    else setStay(true);
  }, []);

  return stay ? children : null;
}
