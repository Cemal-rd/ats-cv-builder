"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { useSwitchLocale } from "@/hooks/use-switch-locale";
import type { ResumeLocale, TemplateId } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";
import { FontSelect } from "./font-select";
import { ResumePreview } from "./resume-preview";
import { TEMPLATES } from "./templates";

const TEMPLATE_OPTIONS = Object.values(TEMPLATES).map((t) => ({ value: t.id, label: t.name }));
const LOCALE_OPTIONS = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
] as const satisfies readonly { value: ResumeLocale; label: string }[];

export function PreviewPanel() {
  const template = useResumeStore((s) => s.template);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const locale = useResumeStore((s) => s.locale);
  const hasOtherVersion = useResumeStore((s) => Boolean(s.versions[s.locale === "tr" ? "en" : "tr"]));
  const switchLocale = useSwitchLocale();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-background px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<TemplateId>
            ariaLabel="Şablon"
            value={template}
            options={TEMPLATE_OPTIONS}
            onChange={setTemplate}
          />
          <FontSelect />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground" title="TR ve EN sürümler ayrı ayrı saklanır">
            CV sürümü
          </span>
          <SegmentedControl<ResumeLocale>
            ariaLabel="CV dil sürümü"
            value={locale}
            options={LOCALE_OPTIONS}
            onChange={switchLocale}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <p className="mb-3 text-center text-xs text-muted-foreground">
          {TEMPLATES[template].description}
          {!hasOtherVersion && " · Diğer dile geçtiğinizde içerik kopyalanır, ayrı bir sürüm olarak çevirebilirsiniz."}
        </p>
        <ResumePreview />
      </div>
    </div>
  );
}
