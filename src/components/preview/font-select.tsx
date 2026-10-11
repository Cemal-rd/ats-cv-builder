"use client";

import { Type } from "lucide-react";
import { CV_FONTS, type CvFontCategory } from "@/lib/fonts/cv-fonts";
import { CV_FONT_IDS, type CvFontId } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";

const GROUPS: { category: Exclude<CvFontCategory, "default">; label: string }[] = [
  { category: "sans", label: "Sans-serif (modern, ekranda net)" },
  { category: "serif", label: "Serif (klasik, kurumsal)" },
];

/** Listede yalnızca ATS'lerin sorunsuz ayrıştırdığı sade yazı tipleri vardır. */
export function FontSelect() {
  const font = useResumeStore((s) => s.font);
  const setFont = useResumeStore((s) => s.setFont);

  return (
    <label className="flex items-center gap-2" title="Tüm seçenekler ATS uyumludur">
      <Type className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <span className="sr-only">Yazı tipi</span>
      <select
        value={font}
        onChange={(event) => setFont(event.target.value as CvFontId)}
        className="h-7 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="template">{CV_FONTS.template.label}</option>
        {GROUPS.map(({ category, label }) => (
          <optgroup key={category} label={label}>
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
