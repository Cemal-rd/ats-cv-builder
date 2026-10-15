"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useI18n } from "@/i18n/provider";
import { createEducation } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

export function EducationSection() {
  const { t } = useI18n();
  const list = useResumeList("education", createEducation);

  return (
    <ListSection
      list={list}
      emptyText={t.education.empty}
      addLabel={t.education.add}
      renderItem={(props) => <EducationItem {...props} />}
    />
  );
}

function EducationItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { t } = useI18n();
  const { control } = useFormContext<Resume>();
  const [institution, field] = useWatch({
    control,
    name: [`education.${index}.institution`, `education.${index}.field`],
  });
  const prefix = `education.${index}` as const;

  return (
    <ListItemCard
      title={institution || t.education.newItem}
      subtitle={field}
      index={index}
      total={total}
      onMove={onMove}
      onRemove={onRemove}
    >
      <TextField name={`${prefix}.institution`} label={t.education.institution} placeholder={t.education.institutionPlaceholder} className="sm:col-span-2" />
      <TextField name={`${prefix}.degree`} label={t.education.degree} placeholder={t.education.degreePlaceholder} />
      <TextField name={`${prefix}.field`} label={t.education.field} placeholder={t.education.fieldPlaceholder} />
      <TextField name={`${prefix}.startDate`} label={t.fields.startDate} placeholder="2015" />
      <TextField name={`${prefix}.endDate`} label={t.education.graduation} placeholder="2019" />
      <TextField name={`${prefix}.location`} label={t.fields.location} placeholder={t.education.locationPlaceholder} />
      <TextField name={`${prefix}.gpa`} label={t.education.gpa} placeholder="3.45/4.00" />
      <TextField
        name={`${prefix}.description`}
        label={t.education.description}
        multiline
        rows={2}
        hint={t.education.hint}
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
