"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/provider";
import { createSampleResumeFor, isSampleResume } from "@/lib/schema/factories";
import type { ResumeLocale } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";
import { useReplaceResume } from "./use-replace-resume";

/**
 * CV'nin dil sürümünü değiştirir. Hedef sürüm yoksa mevcut içerik kopyalanır,
 * kullanıcı çeviriyi kendisi yapar (otomatik çeviri yok). Mevcut CV henüz
 * dokunulmamış örnek CV ise hedef dilin örneği yüklenir (Ayşe Yılmaz ↔ John Doe).
 */
export function useSwitchLocale() {
  const replaceResume = useReplaceResume();
  const { t } = useI18n();

  return useCallback(
    (next: ResumeLocale) => {
      const { locale, versions, resume, setLocale } = useResumeStore.getState();
      if (next === locale) return;

      const existing = versions[next];
      const names = t.versionSwitch.names;
      setLocale(next);

      if (existing) {
        replaceResume(existing);
      } else if (isSampleResume(resume)) {
        replaceResume(createSampleResumeFor(next));
        toast.info(t.versionSwitch.sampleLoaded(names[next]), { description: t.versionSwitch.sampleLoadedDesc });
      } else {
        replaceResume(structuredClone(resume));
        toast.info(t.versionSwitch.created(names[next]), { description: t.versionSwitch.copied(names[locale]) });
      }
    },
    [replaceResume, t],
  );
}
