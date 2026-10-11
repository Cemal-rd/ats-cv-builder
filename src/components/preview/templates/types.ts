import type { Resume, ResumeLocale, TemplateId } from "@/lib/schema/resume";

export interface TemplateProps {
  resume: Resume;
  locale: ResumeLocale;
  /** Kullanıcının seçtiği CSS font yığını; yoksa şablonun varsayılanı. */
  fontFamily?: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  component: React.ComponentType<TemplateProps>;
}
