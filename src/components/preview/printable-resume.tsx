"use client";

import { useResumeStore } from "@/store/resume-store";
import { TemplateRenderer } from "./templates";

/** Ekranda gizli; yalnızca yazdırma / PDF çıktısında görünen, ölçeklenmemiş CV. */
export function PrintableResume() {
  const resume = useResumeStore((s) => s.resume);
  const template = useResumeStore((s) => s.template);
  const locale = useResumeStore((s) => s.locale);
  const font = useResumeStore((s) => s.font);
  const header = useResumeStore((s) => s.header);

  return (
    <div id="print-root" className="hidden print:block">
      <TemplateRenderer resume={resume} template={template} font={font} header={header} locale={locale} />
    </div>
  );
}
