"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { Resume } from "@/lib/schema/resume";
import { countWords } from "@/lib/utils";
import { TextField } from "../form/text-field";

export function SummarySection() {
  const { control } = useFormContext<Resume>();
  const summary = useWatch({ control, name: "summary" });
  const words = countWords(summary ?? "");

  return (
    <div className="space-y-1.5">
      <TextField
        name="summary"
        label="Profesyonel Özet"
        multiline
        rows={5}
        placeholder="Deneyim yılınız, uzmanlık alanlarınız ve en güçlü 1–2 başarınız…"
      />
      <p className="text-right text-xs text-muted-foreground">{words} kelime · önerilen 30–100</p>
    </div>
  );
}
