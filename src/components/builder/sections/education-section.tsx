"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { createEducation } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

export function EducationSection() {
  const list = useResumeList("education", createEducation);

  return (
    <ListSection
      list={list}
      emptyText="Henüz eğitim eklenmedi."
      addLabel="Eğitim ekle"
      renderItem={(props) => <EducationItem {...props} />}
    />
  );
}

function EducationItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { control } = useFormContext<Resume>();
  const [institution, field] = useWatch({
    control,
    name: [`education.${index}.institution`, `education.${index}.field`],
  });
  const prefix = `education.${index}` as const;

  return (
    <ListItemCard
      title={institution || "Yeni okul"}
      subtitle={field}
      index={index}
      total={total}
      onMove={onMove}
      onRemove={onRemove}
    >
      <TextField name={`${prefix}.institution`} label="Okul" placeholder="Örnek Üniversitesi" className="sm:col-span-2" />
      <TextField name={`${prefix}.degree`} label="Derece" placeholder="Lisans" />
      <TextField name={`${prefix}.field`} label="Bölüm" placeholder="Bilgisayar Mühendisliği" />
      <TextField name={`${prefix}.startDate`} label="Başlangıç" placeholder="2015" />
      <TextField name={`${prefix}.endDate`} label="Mezuniyet" placeholder="2019" />
      <TextField name={`${prefix}.location`} label="Konum" placeholder="Ankara" />
      <TextField name={`${prefix}.gpa`} label="Not ortalaması" placeholder="3.45/4.00" />
      <TextField
        name={`${prefix}.description`}
        label="Ek bilgi (opsiyonel)"
        multiline
        rows={2}
        hint="Onur derecesi, tez, ilgili dersler — her satır bir madde."
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
