"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useI18n } from "@/i18n/provider";
import { createSkillGroup } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

export function SkillsSection() {
  const { t } = useI18n();
  const list = useResumeList("skills", createSkillGroup);

  return (
    <ListSection
      list={list}
      emptyText={t.skills.empty}
      addLabel={t.skills.add}
      renderItem={(props) => <SkillGroupItem {...props} />}
    />
  );
}

function SkillGroupItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { t } = useI18n();
  const { control } = useFormContext<Resume>();
  const category = useWatch({ control, name: `skills.${index}.category` });

  return (
    <ListItemCard title={category || t.skills.newItem} index={index} total={total} onMove={onMove} onRemove={onRemove}>
      <TextField
        name={`skills.${index}.category`}
        label={t.skills.category}
        placeholder={t.skills.categoryPlaceholder}
        className="sm:col-span-2"
      />
      <TextField
        name={`skills.${index}.items`}
        label={t.skills.items}
        multiline
        rows={2}
        placeholder="React, TypeScript, Next.js"
        hint={t.skills.hint}
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
