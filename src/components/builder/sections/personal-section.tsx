"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { useI18n } from "@/i18n/provider";
import type { Resume } from "@/lib/schema/resume";
import { PhotoField } from "../form/photo-field";
import { TextField } from "../form/text-field";

const LICENSE_OPTIONS = ["B", "A2, B", "B, C", "B, D", "B, E"];

export function PersonalSection() {
  const { t } = useI18n();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <PhotoField />
      <TextField name="personal.fullName" label={t.personal.fullName} placeholder={t.personal.fullNamePlaceholder} autoComplete="name" />
      <TextField name="personal.title" label={t.personal.title} placeholder={t.personal.titlePlaceholder} />
      <TextField name="personal.email" label={t.personal.email} type="email" placeholder={t.personal.emailPlaceholder} autoComplete="email" />
      <TextField name="personal.phone" label={t.personal.phone} type="tel" placeholder={t.personal.phonePlaceholder} autoComplete="tel" />
      <TextField name="personal.location" label={t.fields.location} placeholder={t.personal.locationPlaceholder} />
      <TextField name="personal.linkedin" label="LinkedIn" placeholder={t.personal.linkedinPlaceholder} />
      <TextField
        name="personal.website"
        label={t.personal.website}
        placeholder={t.personal.websitePlaceholder}
        className="sm:col-span-2"
      />
      <TurkeySpecificFields />
    </div>
  );
}

/** Varsayılan olarak kapalı; doluysa açık başlar ki kullanıcı verisini görsün. */
function TurkeySpecificFields() {
  const { t } = useI18n();
  const r = t.personal.regional;
  const { control } = useFormContext<Resume>();
  const values = useWatch({
    control,
    name: ["personal.birthDate", "personal.militaryStatus", "personal.drivingLicense"],
  });
  const filledCount = values.filter((value) => value?.trim()).length;
  // Yalnızca ilk render'da belirlenir; sonradan React'in kullanıcının aç/kapa tercihini ezmemesi için.
  const [initiallyOpen] = useState(filledCount > 0);

  return (
    <details className="group rounded-lg border sm:col-span-2" open={initiallyOpen || undefined}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
        {r.title}
        <span className="text-xs font-normal text-muted-foreground">
          ({r.optional}{filledCount > 0 ? ` · ${r.filled(filledCount)}` : ""})
        </span>
      </summary>
      <div className="grid gap-3 border-t p-3 sm:grid-cols-3">
        <p className="text-xs text-muted-foreground sm:col-span-3">
          {r.note}
        </p>
        <TextField
          name="personal.militaryStatus"
          label={r.military}
          placeholder={r.militaryPlaceholder}
          suggestions={r.militaryOptions}
          hint={r.militaryHint}
        />
        <TextField name="personal.drivingLicense" label={r.license} placeholder="B" suggestions={LICENSE_OPTIONS} />
        <TextField
          name="personal.birthDate"
          label={r.birthDate}
          placeholder={r.birthDatePlaceholder}
          hint={r.birthDateHint}
        />
      </div>
    </details>
  );
}
