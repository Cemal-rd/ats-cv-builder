"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Resume } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";

/**
 * Form → store tek yönlü senkronizasyon. RHF iç değer nesnesini yerinde
 * değiştirebildiği için her güncellemede derin kopya alınır; aksi halde
 * Zustand seçicileri değişikliği fark etmez.
 */
export function useFormStoreSync(form: UseFormReturn<Resume>) {
  const setResume = useResumeStore((s) => s.setResume);

  useEffect(() => {
    const subscription = form.watch((values) => {
      setResume(structuredClone(values) as Resume);
    });
    return () => subscription.unsubscribe();
  }, [form, setResume]);
}
