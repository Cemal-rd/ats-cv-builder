"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { createProject } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

export function ProjectsSection() {
  const list = useResumeList("projects", createProject);

  return (
    <ListSection
      list={list}
      emptyText="Henüz proje eklenmedi."
      addLabel="Proje ekle"
      renderItem={(props) => <ProjectItem {...props} />}
    />
  );
}

function ProjectItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { control } = useFormContext<Resume>();
  const [name, role] = useWatch({ control, name: [`projects.${index}.name`, `projects.${index}.role`] });
  const prefix = `projects.${index}` as const;

  return (
    <ListItemCard
      title={name || "Yeni proje"}
      subtitle={role}
      index={index}
      total={total}
      onMove={onMove}
      onRemove={onRemove}
    >
      <TextField name={`${prefix}.name`} label="Proje adı" placeholder="Açık kaynak form kütüphanesi" />
      <TextField name={`${prefix}.role`} label="Rolünüz" placeholder="Geliştirici" />
      <TextField name={`${prefix}.startDate`} label="Başlangıç" placeholder="2023" />
      <TextField name={`${prefix}.endDate`} label="Bitiş" placeholder="2024" />
      <TextField name={`${prefix}.url`} label="Bağlantı" placeholder="github.com/…" className="sm:col-span-2" />
      <TextField
        name={`${prefix}.description`}
        label="Açıklama"
        multiline
        rows={4}
        hint="Her satır bir madde. Kullanılan teknolojileri ve somut sonucu belirtin."
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
