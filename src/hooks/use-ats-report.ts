"use client";

import { useDeferredValue, useMemo } from "react";
import { analyzeResume } from "@/lib/ats/analyze";
import { useResumeStore } from "@/store/resume-store";

/** Yazım sırasında arayüzü bloklamamak için analiz ertelenmiş değer üzerinden yapılır. */
export function useAtsReport() {
  const resume = useResumeStore((s) => s.resume);
  const locale = useResumeStore((s) => s.locale);
  const deferredResume = useDeferredValue(resume);
  return useMemo(() => analyzeResume(deferredResume, locale), [deferredResume, locale]);
}
