"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { createSkillGroup } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

export function SkillsSection() {
  const list = useResumeList("skills", createSkillGroup);

  return (
    <ListSection
      list={list}
      emptyText="Henüz yetenek grubu eklenmedi."
      addLabel="Yetenek grubu ekle"
      renderItem={(props) => <SkillGroupItem {...props} />}
    />
  );
}

function SkillGroupItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { control } = useFormContext<Resume>();
  const category = useWatch({ control, name: `skills.${index}.category` });

  return (
    <ListItemCard title={category || "Yetenek grubu"} index={index} total={total} onMove={onMove} onRemove={onRemove}>
      <TextField
        name={`skills.${index}.category`}
        label="Kategori"
        placeholder="Frontend, Araçlar, Diller…"
        className="sm:col-span-2"
      />
      <TextField
        name={`skills.${index}.items`}
        label="Yetenekler"
        multiline
        rows={2}
        placeholder="React, TypeScript, Next.js"
        hint="Virgülle ayırın. İlandaki terimlerle birebir aynı yazımı kullanın."
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
