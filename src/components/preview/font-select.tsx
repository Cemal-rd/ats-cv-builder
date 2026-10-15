"use client";

import { Type } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { CV_FONTS, type CvFontCategory } from "@/lib/fonts/cv-fonts";
import { CV_FONT_IDS, type CvFontId } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";

const GROUPS = [
  { category: "sans", label: "sansGroup" },
  { category: "serif", label: "serifGroup" },
] as const satisfies readonly { category: Exclude<CvFontCategory, "default">; label: string }[];

/** Listede yalnızca ATS'lerin sorunsuz ayrıştırdığı sade yazı tipleri vardır. */
export function FontSelect() {
  const font = useResumeStore((s) => s.font);
  const setFont = useResumeStore((s) => s.setFont);
  const { t } = useI18n();

  return (
    <label className="flex items-center gap-2" title={t.font.title}>
      <Type className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <span className="sr-only">{t.font.aria}</span>
      <select
        value={font}
        onChange={(event) => setFont(event.target.value as CvFontId)}
        className="h-7 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="template">{t.font.templateDefault}</option>
        {GROUPS.map(({ category, label }) => (
          <optgroup key={category} label={t.font[label]}>
            {CV_FONT_IDS.filter((id) => CV_FONTS[id].category === category).map((id) => (
              <option key={id} value={id}>
                {CV_FONTS[id].label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
