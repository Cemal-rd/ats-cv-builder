"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { ResumeLocale } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";
import { useReplaceResume } from "./use-replace-resume";

const LOCALE_NAMES: Record<ResumeLocale, string> = { tr: "Türkçe", en: "İngilizce" };

/**
 * CV'nin dil sürümünü değiştirir. Hedef sürüm yoksa mevcut içerik kopyalanır,
 * kullanıcı çeviriyi kendisi yapar (otomatik çeviri yok).
 */
export function useSwitchLocale() {
  const replaceResume = useReplaceResume();

  return useCallback(
    (next: ResumeLocale) => {
      const { locale, versions, resume, setLocale } = useResumeStore.getState();
      if (next === locale) return;

      const existing = versions[next];
      setLocale(next);
      replaceResume(existing ?? structuredClone(resume));

      if (!existing) {
        toast.info(`${LOCALE_NAMES[next]} sürüm oluşturuldu`, {
          description: `${LOCALE_NAMES[locale]} içerik kopyalandı; şimdi çevirebilirsiniz. İki sürüm ayrı ayrı saklanır.`,
        });
      }
    },
    [replaceResume],
  );
}
