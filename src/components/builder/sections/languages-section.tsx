"use client";

import { createLanguage } from "@/lib/schema/factories";
import { LANGUAGE_LEVELS } from "@/lib/schema/resume";
import { resumeLabels } from "@/lib/resume/labels";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { SelectField } from "../form/select-field";
import { TextField } from "../form/text-field";

const LEVEL_OPTIONS = LANGUAGE_LEVELS.map((level) => ({ value: level, label: resumeLabels.tr.languageLevels[level] }));
const LANGUAGE_SUGGESTIONS = ["Türkçe", "İngilizce", "Almanca", "Fransızca", "İspanyolca", "Arapça", "Rusça", "İtalyanca", "Japonca", "Çince"];

export function LanguagesSection() {
  const list = useResumeList("languages", createLanguage);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Seviyeler Avrupa Dil Portföyü (CEFR) ölçeğindedir; CV&apos;de seçili dile göre yazılır.
      </p>
      <ListSection
        list={list}
        emptyText="Henüz dil eklenmedi."
        addLabel="Dil ekle"
        renderItem={(props) => <LanguageItem {...props} />}
      />
    </div>
  );
}

function LanguageItem(props: ListItemProps) {
  const prefix = `languages.${props.index}` as const;
  return (
    <ListItemCard title="" compact {...props}>
      <TextField name={`${prefix}.name`} label="Dil" placeholder="İngilizce" suggestions={LANGUAGE_SUGGESTIONS} />
      <SelectField name={`${prefix}.level`} label="Seviye" options={LEVEL_OPTIONS} />
    </ListItemCard>
  );
}
