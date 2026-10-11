"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type { Resume } from "@/lib/schema/resume";
import { PhotoField } from "../form/photo-field";
import { TextField } from "../form/text-field";

const MILITARY_OPTIONS = ["Yapıldı", "Muaf", "Tecilli", "Yükümlü değil"];
const LICENSE_OPTIONS = ["B", "A2, B", "B, C", "B, D", "B, E"];

export function PersonalSection() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <PhotoField />
      <TextField name="personal.fullName" label="Ad Soyad" placeholder="Ayşe Yılmaz" autoComplete="name" />
      <TextField name="personal.title" label="Unvan / Hedef Pozisyon" placeholder="Kıdemli Frontend Geliştirici" />
      <TextField name="personal.email" label="E-posta" type="email" placeholder="ad@ornek.com" autoComplete="email" />
      <TextField name="personal.phone" label="Telefon" type="tel" placeholder="+90 555 123 45 67" autoComplete="tel" />
      <TextField name="personal.location" label="Konum" placeholder="İstanbul, Türkiye" />
      <TextField name="personal.linkedin" label="LinkedIn" placeholder="linkedin.com/in/adiniz" />
      <TextField
        name="personal.website"
        label="Web sitesi / Portfolyo"
        placeholder="github.com/adiniz"
        className="sm:col-span-2"
      />
      <TurkeySpecificFields />
    </div>
  );
}

/** Varsayılan olarak kapalı; doluysa açık başlar ki kullanıcı verisini görsün. */
function TurkeySpecificFields() {
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
        Türkiye&apos;ye özel alanlar
        <span className="text-xs font-normal text-muted-foreground">
          (opsiyonel{filledCount > 0 ? ` · ${filledCount} dolu` : ""})
        </span>
      </summary>
      <div className="grid gap-3 border-t p-3 sm:grid-cols-3">
        <p className="text-xs text-muted-foreground sm:col-span-3">
          Yalnızca doldurduğunuz alanlar CV&apos;de görünür. Yurt dışı başvurularında bu bilgileri boş bırakın.
        </p>
        <TextField
          name="personal.militaryStatus"
          label="Askerlik durumu"
          placeholder="Yapıldı"
          suggestions={MILITARY_OPTIONS}
          hint="Tecilliyse tarihini ekleyin."
        />
        <TextField name="personal.drivingLicense" label="Ehliyet" placeholder="B" suggestions={LICENSE_OPTIONS} />
        <TextField
          name="personal.birthDate"
          label="Doğum tarihi"
          placeholder="01.01.1995"
          hint="Zorunlu değil; yaş ayrımcılığına yol açabilir."
        />
      </div>
    </details>
  );
}
