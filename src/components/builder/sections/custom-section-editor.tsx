"use client";

import { Info, Trash2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { createCustomEntry } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { hasText } from "@/lib/utils";
import { useResumeList } from "@/hooks/use-resume-list";
import { CUSTOM_SECTION_PRESETS } from "../custom-sections/presets";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

const TITLE_SUGGESTIONS = CUSTOM_SECTION_PRESETS.flatMap((preset) => [preset.title.tr, preset.title.en]);

interface CustomSectionEditorProps {
  sectionIndex: number;
  onDeleteSection: () => void;
}

export function CustomSectionEditor({ sectionIndex, onDeleteSection }: CustomSectionEditorProps) {
  const { control } = useFormContext<Resume>();
  const { t } = useI18n();
  const list = useResumeList(`customSections.${sectionIndex}.entries`, createCustomEntry);
  const [title, entries] = useWatch({
    control,
    name: [`customSections.${sectionIndex}.title`, `customSections.${sectionIndex}.entries`],
  });

  const missing = [
    !title?.trim() && t.custom.needsTitle,
    !entries?.some((e) => hasText(e.title, e.subtitle, e.description)) && t.custom.needsEntry,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className="space-y-3">
      <TextField
        name={`customSections.${sectionIndex}.title`}
        label={t.custom.sectionTitle}
        placeholder={t.custom.sectionTitlePlaceholder}
        suggestions={TITLE_SUGGESTIONS}
        hint={t.custom.sectionTitleHint}
      />
      {missing.length > 0 && (
        <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t.custom.missing(missing)}
        </p>
      )}
      <ListSection
        list={list}
        emptyText={t.custom.empty}
        addLabel={t.custom.add}
        renderItem={(props) => <CustomEntryItem sectionIndex={sectionIndex} {...props} />}
      />
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-muted-foreground hover:text-destructive"
        onClick={onDeleteSection}
      >
        <Trash2 />
        {t.custom.deleteSection}
      </Button>
    </div>
  );
}

function CustomEntryItem({ sectionIndex, ...props }: ListItemProps & { sectionIndex: number }) {
  const { control } = useFormContext<Resume>();
  const { t } = useI18n();
  const prefix = `customSections.${sectionIndex}.entries.${props.index}` as const;
  const [title, subtitle] = useWatch({ control, name: [`${prefix}.title`, `${prefix}.subtitle`] });

  return (
    <ListItemCard title={title || t.custom.newEntry} subtitle={subtitle} {...props}>
      <TextField name={`${prefix}.title`} label={t.custom.entryTitle} placeholder={t.custom.entryTitlePlaceholder} />
      <TextField name={`${prefix}.subtitle`} label={t.custom.entrySubtitle} placeholder={t.custom.entrySubtitlePlaceholder} />
      <TextField name={`${prefix}.date`} label={t.fields.date} placeholder="2021 – 2023" className="sm:col-span-2" />
      <TextField
        name={`${prefix}.description`}
        label={t.custom.entryDescription}
        multiline
        rows={3}
        hint={t.fields.bulletHint}
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
