"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useI18n } from "@/i18n/provider";
import type { Resume } from "@/lib/schema/resume";
import { countWords } from "@/lib/utils";
import { TextField } from "../form/text-field";

export function SummarySection() {
  const { control } = useFormContext<Resume>();
  const { t } = useI18n();
  const summary = useWatch({ control, name: "summary" });
  const words = countWords(summary ?? "");

  return (
    <div className="space-y-1.5">
      <TextField name="summary" label={t.summary.label} multiline rows={5} placeholder={t.summary.placeholder} />
      <p className="text-right text-xs text-muted-foreground">{t.summary.wordCount(words)}</p>
    </div>
  );
}
