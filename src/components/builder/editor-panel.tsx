"use client";

import { useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Award,
  Briefcase,
  FileText,
  FolderGit2,
  GraduationCap,
  Languages,
  LayoutList,
  RotateCcw,
  Sparkles,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DragHandle, SortableItem, SortableList } from "@/components/ui/sortable";
import { useReplaceResume } from "@/hooks/use-replace-resume";
import { editorSectionLabels } from "@/lib/resume/labels";
import {
  customSectionIdFromKey,
  customSectionKey,
  isCustomSectionKey,
  resolveSectionOrder,
  type SectionKey,
} from "@/lib/resume/sections";
import { createCustomSection, createEmptyResume, createSampleResume } from "@/lib/schema/factories";
import type { BuiltinSectionKey, Resume } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";
import { AddSectionMenu } from "./custom-sections/add-section-menu";
import { IconPicker } from "./custom-sections/icon-picker";
import type { CustomSectionPreset } from "./custom-sections/presets";
import { CertificationsSection } from "./sections/certifications-section";
import { CustomSectionEditor } from "./sections/custom-section-editor";
import { EducationSection } from "./sections/education-section";
import { ExperienceSection } from "./sections/experience-section";
import { LanguagesSection } from "./sections/languages-section";
import { PersonalSection } from "./sections/personal-section";
import { ProjectsSection } from "./sections/projects-section";
import { SkillsSection } from "./sections/skills-section";
import { SummarySection } from "./sections/summary-section";

const BUILTIN_EDITORS: Record<BuiltinSectionKey, { icon: LucideIcon; Component: React.ComponentType }> = {
  experience: { icon: Briefcase, Component: ExperienceSection },
  education: { icon: GraduationCap, Component: EducationSection },
  skills: { icon: Wrench, Component: SkillsSection },
  languages: { icon: Languages, Component: LanguagesSection },
  projects: { icon: FolderGit2, Component: ProjectsSection },
  certifications: { icon: Award, Component: CertificationsSection },
};

export function EditorPanel() {
  const { control, getValues, setValue } = useFormContext<Resume>();
  const replace = useReplaceResume();
  const [openSections, setOpenSections] = useState<string[]>(["personal", "experience"]);

  const customSections = useFieldArray({ control, name: "customSections", keyName: "fieldKey" });
  const [sectionOrder, customSectionValues] = useWatch({ control, name: ["sectionOrder", "customSections"] });
  const order = resolveSectionOrder({ ...getValues(), sectionOrder, customSections: customSectionValues });

  const setOrder = (next: SectionKey[]) => setValue("sectionOrder", next, { shouldDirty: true });

  // Yeni eklenen bölüm render edildikten sonra ona kaydır ve ilk boş alana odaklan.
  const [pendingFocus, setPendingFocus] = useState<{ key: SectionKey; fieldId: string } | null>(null);
  useEffect(() => {
    if (!pendingFocus) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(sectionDomId(pendingFocus.key))?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById(pendingFocus.fieldId)?.focus({ preventScroll: true });
      setPendingFocus(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingFocus]);

  const addCustomSection = (preset: CustomSectionPreset | null) => {
    const locale = useResumeStore.getState().locale;
    const section = createCustomSection(preset?.title[locale] ?? "", preset?.icon ?? "list");
    const index = customSections.fields.length;
    customSections.append(section, { shouldFocus: false });
    const key = customSectionKey(section.id);
    setOrder([...order, key]);
    setOpenSections((open) => [...open, key]);
    setPendingFocus({
      key,
      // Hazır bölümde başlık dolu gelir → ilk kayda; boş bölümde başlığa odaklan.
      fieldId: preset
        ? `field-customSections-${index}-entries-0-title`
        : `field-customSections-${index}-title`,
    });
  };

  const deleteCustomSection = (key: SectionKey, index: number) => {
    const previous = structuredClone(getValues());
    customSections.remove(index);
    setOrder(order.filter((k) => k !== key));
    toast("Bölüm silindi", { action: { label: "Geri al", onClick: () => replace(previous) } });
  };

  /** Mevcut veriyi geri alınabilir şekilde değiştirir. */
  const replaceResume = (next: Resume, message: string) => {
    const previous = structuredClone(getValues());
    replace(next);
    toast(message, { action: { label: "Geri al", onClick: () => replace(previous) } });
  };

  return (
    <div className="px-4 pb-8">
      <Accordion type="multiple" value={openSections} onValueChange={setOpenSections}>
        <EditorSection value="personal" icon={User} title="Kişisel Bilgiler" description="Ad, iletişim, fotoğraf">
          <PersonalSection />
        </EditorSection>
        <EditorSection value="summary" icon={FileText} title="Özet / Hakkımda" description="Kısa profesyonel özet">
          <SummarySection />
        </EditorSection>

        <p className="flex items-center gap-1.5 pb-1 pt-4 text-xs text-muted-foreground">
          <LayoutList className="h-3.5 w-3.5" />
          Aşağıdaki bölümlerin CV&apos;deki sırasını tutamaçtan sürükleyerek değiştirebilirsiniz.
        </p>

        <SortableList ids={order} onMove={(from, to) => setOrder(arrayMove(order, from, to))}>
          {order.map((key) => {
            if (!isCustomSectionKey(key)) {
              const { icon, Component } = BUILTIN_EDITORS[key];
              return (
                <SortableItem key={key} id={key} className="bg-background">
                  <EditorSection value={key} icon={icon} sortable {...editorSectionLabels[key]}>
                    <Component />
                  </EditorSection>
                </SortableItem>
              );
            }

            const id = customSectionIdFromKey(key);
            const index = customSections.fields.findIndex((field) => field.id === id);
            if (index === -1) return null;
            return (
              <SortableItem key={key} id={key} className="bg-background">
                <CustomSectionHeader index={index}>
                  {({ title, icon }) => (
                    <EditorSection
                      value={key}
                      icon={LayoutList}
                      sortable
                      title={title}
                      description="Özel bölüm"
                      leading={
                        <IconPicker
                          value={icon}
                          onChange={(next) =>
                            setValue(`customSections.${index}.icon`, next, { shouldDirty: true })
                          }
                        />
                      }
                    >
                      <CustomSectionEditor sectionIndex={index} onDeleteSection={() => deleteCustomSection(key, index)} />
                    </EditorSection>
                  )}
                </CustomSectionHeader>
              </SortableItem>
            );
          })}
        </SortableList>
      </Accordion>

      <AddSectionMenu onAdd={addCustomSection} />
      <p className="mt-1.5 text-center text-xs text-muted-foreground">
        Gönüllülük, Yayınlar, Ödüller, Referanslar, Hobiler…
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => replaceResume(createSampleResume(), "Örnek CV yüklendi")}>
          <Sparkles />
          Örnek CV yükle
        </Button>
        <Button variant="ghost" size="sm" onClick={() => replaceResume(createEmptyResume(), "Form temizlendi")}>
          <RotateCcw />
          Formu temizle
        </Button>
      </div>
    </div>
  );
}

const sectionDomId = (value: string) => `editor-section-${value}`;

interface EditorSectionProps {
  value: string;
  icon: LucideIcon;
  title: string;
  description: string;
  sortable?: boolean;
  /** Simgenin yerine geçen etkileşimli öğe (ör. simge seçici). Tetikleyici butonun dışında render edilir. */
  leading?: React.ReactNode;
  children: React.ReactNode;
}

function EditorSection({ value, icon: Icon, title, description, sortable, leading, children }: EditorSectionProps) {
  return (
    <AccordionItem value={value} id={sectionDomId(value)} className="scroll-mt-2">
      <div className="flex items-center gap-1">
        {sortable && <DragHandle label={`${title} bölümünü sürükle`} className="-ml-1.5" />}
        {leading && <div className="mr-2">{leading}</div>}
        <AccordionTrigger className="flex-1 hover:no-underline">
          <span className="flex items-center gap-3 text-left">
            {!leading && (
              <span className="grid h-8 w-8 place-items-center rounded-md bg-muted">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="block text-xs font-normal text-muted-foreground">{description}</span>
            </span>
          </span>
        </AccordionTrigger>
      </div>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

/** Özel bölüm başlığını ve simgesini canlı izler; yalnızca ilgili akordeon başlığı yeniden render edilir. */
function CustomSectionHeader({
  index,
  children,
}: {
  index: number;
  children: (header: { title: string; icon: string }) => React.ReactNode;
}) {
  const { control } = useFormContext<Resume>();
  const [title, icon] = useWatch({ control, name: [`customSections.${index}.title`, `customSections.${index}.icon`] });
  return <>{children({ title: title?.trim() || "Adsız bölüm", icon: icon ?? "list" })}</>;
}
