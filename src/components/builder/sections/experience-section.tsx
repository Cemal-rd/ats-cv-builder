"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { createExperience } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

const BULLET_HINT = "Her satır bir madde. Aksiyon fiili kullanın ve sonucu ölçün (ör. \"…süreyi %30 azalttım\").";

export function ExperienceSection() {
  const list = useResumeList("experience", createExperience);

  return (
    <ListSection
      list={list}
      emptyText="Henüz deneyim eklenmedi."
      addLabel="Deneyim ekle"
      renderItem={(props) => <ExperienceItem {...props} />}
    />
  );
}

function ExperienceItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { control, register } = useFormContext<Resume>();
  const [position, company, current] = useWatch({
    control,
    name: [`experience.${index}.position`, `experience.${index}.company`, `experience.${index}.current`],
  });
  const prefix = `experience.${index}` as const;

  return (
    <ListItemCard
      title={position || "Yeni pozisyon"}
      subtitle={company}
      index={index}
      total={total}
      onMove={onMove}
      onRemove={onRemove}
    >
      <TextField name={`${prefix}.position`} label="Pozisyon" placeholder="Frontend Geliştirici" />
      <TextField name={`${prefix}.company`} label="Şirket" placeholder="Şirket A.Ş." />
      <TextField name={`${prefix}.startDate`} label="Başlangıç" placeholder="Oca 2022" />
      {current ? (
        <div className="flex items-end pb-2 text-sm text-muted-foreground">Halen bu pozisyondayım</div>
      ) : (
        <TextField name={`${prefix}.endDate`} label="Bitiş" placeholder="Ara 2023" />
      )}
      <TextField name={`${prefix}.location`} label="Konum" placeholder="İstanbul" />
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" className="h-4 w-4 rounded accent-slate-900 dark:accent-slate-100" {...register(`${prefix}.current`)} />
        Halen çalışıyorum
      </label>
      <TextField
        name={`${prefix}.description`}
        label="Başarılar ve sorumluluklar"
        multiline
        rows={5}
        hint={BULLET_HINT}
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
