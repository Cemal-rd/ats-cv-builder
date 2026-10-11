import { sanitizeResumeForOutput } from "@/lib/resume/format";
import { getCvFontStack } from "@/lib/fonts/cv-fonts";
import type { CvFontId, TemplateId } from "@/lib/schema/resume";
import { ClassicTemplate } from "./classic-template";
import { ModernTemplate } from "./modern-template";
import type { TemplateDefinition, TemplateProps } from "./types";

/** Yeni bir şablon eklemek için: bileşeni yazın, TEMPLATE_IDS'e ekleyin ve buraya kaydedin. */
export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  classic: {
    id: "classic",
    name: "Classic Corporate",
    description: "Serif yazı tipi, ortalanmış başlık, geleneksel kurumsal düzen.",
    component: ClassicTemplate,
  },
  modern: {
    id: "modern",
    name: "Modern Clean",
    description: "Sans-serif, sola hizalı, sade ve ferah düzen.",
    component: ModernTemplate,
  },
};

/** Tüm şablonlar emojilerden arındırılmış veriyle render edilir (önizleme = PDF). */
export function TemplateRenderer({
  template,
  font,
  resume,
  locale,
}: Omit<TemplateProps, "fontFamily"> & { template: TemplateId; font: CvFontId }) {
  const Component = (TEMPLATES[template] ?? TEMPLATES.classic).component;
  return <Component resume={sanitizeResumeForOutput(resume)} locale={locale} fontFamily={getCvFontStack(font)} />;
}
