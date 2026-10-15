"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useI18n } from "@/i18n/provider";
import { createExperience } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

export function ExperienceSection() {
  const { t } = useI18n();
  const list = useResumeList("experience", createExperience);

  return (
    <ListSection
      list={list}
      emptyText={t.experience.empty}
      addLabel={t.experience.add}
      renderItem={(props) => <ExperienceItem {...props} />}
    />
  );
}

function ExperienceItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { t } = useI18n();
  const { control, register } = useFormContext<Resume>();
  const [position, company, current] = useWatch({
    control,
    name: [`experience.${index}.position`, `experience.${index}.company`, `experience.${index}.current`],
  });
  const prefix = `experience.${index}` as const;

  return (
    <ListItemCard
      title={position || t.experience.newItem}
      subtitle={company}
      index={index}
      total={total}
      onMove={onMove}
      onRemove={onRemove}
    >
      <TextField name={`${prefix}.position`} label={t.experience.position} placeholder={t.experience.positionPlaceholder} />
      <TextField name={`${prefix}.company`} label={t.experience.company} placeholder={t.experience.companyPlaceholder} />
      <TextField name={`${prefix}.startDate`} label={t.fields.startDate} placeholder={t.experience.startPlaceholder} />
      {current ? (
        <div className="flex items-end pb-2 text-sm text-muted-foreground">{t.experience.currentRole}</div>
      ) : (
        <TextField name={`${prefix}.endDate`} label={t.fields.endDate} placeholder={t.experience.endPlaceholder} />
      )}
      <TextField name={`${prefix}.location`} label={t.fields.location} placeholder={t.experience.locationPlaceholder} />
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" className="h-4 w-4 rounded accent-slate-900 dark:accent-slate-100" {...register(`${prefix}.current`)} />
        {t.experience.currentCheckbox}
      </label>
      <TextField
        name={`${prefix}.description`}
        label={t.experience.description}
        multiline
        rows={5}
        hint={t.experience.hint}
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
