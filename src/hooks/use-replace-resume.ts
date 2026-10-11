"use client";

import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import type { Resume } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";

/** Formu ve store'u birlikte yeni bir CV ile değiştirir (içe aktarma, sıfırlama, geri alma). */
export function useReplaceResume() {
  const form = useFormContext<Resume>();
  const setResume = useResumeStore((s) => s.setResume);

  return useCallback(
    (next: Resume) => {
      form.reset(next);
      setResume(structuredClone(next));
    },
    [form, setResume],
  );
}
