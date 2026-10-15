"use client";

import { useI18n } from "@/i18n/provider";
import { createLanguage } from "@/lib/schema/factories";
import { LANGUAGE_LEVELS } from "@/lib/schema/resume";
import { resumeLabels } from "@/lib/resume/labels";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { SelectField } from "../form/select-field";
import { TextField } from "../form/text-field";

export function LanguagesSection() {
  const list = useResumeList("languages", createLanguage);
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{t.languages.note}</p>
      <ListSection
        list={list}
        emptyText={t.languages.empty}
        addLabel={t.languages.add}
        renderItem={(props) => <LanguageItem {...props} />}
      />
    </div>
  );
}

function LanguageItem(props: ListItemProps) {
  const { t, locale } = useI18n();
  const prefix = `languages.${props.index}` as const;
  const levelOptions = LANGUAGE_LEVELS.map((level) => ({ value: level, label: resumeLabels[locale].languageLevels[level] }));

  return (
    <ListItemCard title="" compact {...props}>
      <TextField
        name={`${prefix}.name`}
        label={t.languages.language}
        placeholder={t.languages.languagePlaceholder}
        suggestions={t.languages.suggestions}
      />
      <SelectField name={`${prefix}.level`} label={t.languages.level} options={levelOptions} />
    </ListItemCard>
  );
}
