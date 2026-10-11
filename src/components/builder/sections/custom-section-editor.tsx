"use client";

import { Info, Trash2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
  const list = useResumeList(`customSections.${sectionIndex}.entries`, createCustomEntry);
  const [title, entries] = useWatch({
    control,
    name: [`customSections.${sectionIndex}.title`, `customSections.${sectionIndex}.entries`],
  });

  const missing = [
    !title?.trim() && "bir başlık",
    !entries?.some((e) => hasText(e.title, e.subtitle, e.description)) && "en az bir dolu kayıt",
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      <TextField
        name={`customSections.${sectionIndex}.title`}
        label="Bölüm başlığı (CV'de görünür)"
        placeholder="Gönüllü Çalışmalar"
        suggestions={TITLE_SUGGESTIONS}
        hint="ATS'lerin tanıması için standart başlıklar tercih edin."
      />
      {missing.length > 0 && (
        <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Önizlemede görünmesi için {missing.join(" ve ")} gerekli.
        </p>
      )}
      <ListSection
        list={list}
        emptyText="Bu bölümde henüz kayıt yok."
        addLabel="Kayıt ekle"
        renderItem={(props) => <CustomEntryItem sectionIndex={sectionIndex} {...props} />}
      />
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-muted-foreground hover:text-destructive"
        onClick={onDeleteSection}
      >
        <Trash2 />
        Bölümü sil
      </Button>
    </div>
  );
}

function CustomEntryItem({ sectionIndex, ...props }: ListItemProps & { sectionIndex: number }) {
  const { control } = useFormContext<Resume>();
  const prefix = `customSections.${sectionIndex}.entries.${props.index}` as const;
  const [title, subtitle] = useWatch({ control, name: [`${prefix}.title`, `${prefix}.subtitle`] });

  return (
    <ListItemCard title={title || "Yeni kayıt"} subtitle={subtitle} {...props}>
      <TextField name={`${prefix}.title`} label="Başlık" placeholder="Gönüllü Eğitmen" />
      <TextField name={`${prefix}.subtitle`} label="Alt başlık / Kurum" placeholder="Örnek Derneği" />
      <TextField name={`${prefix}.date`} label="Tarih" placeholder="2021 – 2023" className="sm:col-span-2" />
      <TextField
        name={`${prefix}.description`}
        label="Açıklama (opsiyonel)"
        multiline
        rows={3}
        hint="Her satır bir madde."
        className="sm:col-span-2"
      />
    </ListItemCard>
  );
}
