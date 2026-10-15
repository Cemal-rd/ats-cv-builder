"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useI18n } from "@/i18n/provider";
import { createProject } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

export function ProjectsSection() {
  const { t } = useI18n();
  const list = useResumeList("projects", createProject);

  return (
    <ListSection
      list={list}
      emptyText={t.projects.empty}
      addLabel={t.projects.add}
      renderItem={(props) => <ProjectItem {...props} />}
    />
  );
}

function ProjectItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { t } = useI18n();
  const { control } = useFormContext<Resume>();
  const [name, role] = useWatch({ control, name: [`projects.${index}.name`, `projects.${index}.role`] });
  const prefix = `projects.${index}` as const;

  return (
    <ListItemCard
      title={name || t.projects.newItem}
      subtitle={role}
      index={index}
      total={total}
      onMove={onMove}
      onRemove={onRemove}
    >
      <TextField name={`${prefix}.name`} label={t.projects.name} placeholder={t.projects.namePlaceholder} />
      <TextField name={`${prefix}.role`} label={t.projects.role} placeholder={t.projects.rolePlaceholder} />
      <TextField name={`${prefix}.startDate`} label={t.fields.startDate} placeholder="2023" />
      <TextField name={`${prefix}.endDate`} label={t.fields.endDate} placeholder="2024" />
      <TextField name={`${prefix}.url`} label={t.fields.link} placeholder="github.com/…" className="sm:col-span-2" />
      <TextField
        name={`${prefix}.description`}
        label={t.projects.description}
        multiline
        rows={4}
        hint={t.projects.hint}
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
