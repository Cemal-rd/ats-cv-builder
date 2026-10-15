"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { useSwitchLocale } from "@/hooks/use-switch-locale";
import { useI18n } from "@/i18n/provider";
import type { ResumeLocale, TemplateId } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";
import { FontSelect } from "./font-select";
import { HeaderLayoutPicker } from "./header-layout-picker";
import { ResumePreview } from "./resume-preview";
import { TEMPLATES } from "./templates";

const TEMPLATE_OPTIONS = Object.values(TEMPLATES).map((t) => ({ value: t.id, label: t.name }));
const RESUME_LOCALES = ["tr", "en"] as const satisfies readonly ResumeLocale[];

export function PreviewPanel() {
  const template = useResumeStore((s) => s.template);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const locale = useResumeStore((s) => s.locale);
  const hasOtherVersion = useResumeStore((s) => Boolean(s.versions[s.locale === "tr" ? "en" : "tr"]));
  const switchLocale = useSwitchLocale();
  const { t } = useI18n();
  const localeOptions = RESUME_LOCALES.map((value) => ({ value, label: t.preview.versionNames[value] }));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-background px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<TemplateId>
            ariaLabel={t.preview.templateAria}
            value={template}
            options={TEMPLATE_OPTIONS}
            onChange={setTemplate}
          />
          <FontSelect />
          <HeaderLayoutPicker />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground" title={t.preview.cvVersionTitle}>
            {t.preview.cvVersion}
          </span>
          <SegmentedControl<ResumeLocale>
            ariaLabel={t.preview.cvVersionAria}
            value={locale}
            options={localeOptions}
            onChange={switchLocale}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <p className="mb-3 text-center text-xs text-muted-foreground">
          {t.preview.templateDescriptions[template]}
          {!hasOtherVersion && ` · ${t.preview.copyHint}`}
        </p>
        <ResumePreview />
      </div>
    </div>
  );
}
