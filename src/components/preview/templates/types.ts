import type { Resume, ResumeLocale, TemplateId } from "@/lib/schema/resume";

export interface TemplateProps {
  resume: Resume;
  locale: ResumeLocale;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  component: React.ComponentType<TemplateProps>;
}
