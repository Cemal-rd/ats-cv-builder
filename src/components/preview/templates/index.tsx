import { getCvFontStack } from "@/lib/fonts/cv-fonts";
import { getPhoto, sanitizeResumeForOutput } from "@/lib/resume/format";
import type { CvFontId, HeaderLayout, TemplateId } from "@/lib/schema/resume";
import { ClassicTemplate } from "./classic-template";
import { ModernTemplate } from "./modern-template";
import { resolveHeaderLayout, type TemplateDefinition, type TemplateProps } from "./types";

/** Yeni bir şablon eklemek için: bileşeni yazın, TEMPLATE_IDS'e ekleyin ve buraya kaydedin. */
export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  classic: {
    id: "classic",
    name: "Classic Corporate",
    description: "Serif yazı tipi, ortalanmış başlık, geleneksel kurumsal düzen.",
    // Fotoğrafsız: isim ortada. Fotoğraflı: fotoğraf solda, isim yanında sola hizalı.
    defaultHeader: (hasPhoto) => ({ align: hasPhoto ? "left" : "center", photoSide: "left" }),
    component: ClassicTemplate,
  },
  modern: {
    id: "modern",
    name: "Modern Clean",
    description: "Sans-serif, sola hizalı, sade ve ferah düzen.",
    defaultHeader: () => ({ align: "left", photoSide: "right" }),
    component: ModernTemplate,
  },
};

/** Tüm şablonlar emojilerden arındırılmış veriyle render edilir (önizleme = PDF). */
export function TemplateRenderer({
  template,
  font,
  header,
  resume,
  locale,
}: Pick<TemplateProps, "resume" | "locale"> & { template: TemplateId; font: CvFontId; header: HeaderLayout }) {
  const definition = TEMPLATES[template] ?? TEMPLATES.classic;
  const Component = definition.component;
  const layout = resolveHeaderLayout(header, definition, Boolean(getPhoto(resume.personal)));
  return (
    <Component
      resume={sanitizeResumeForOutput(resume)}
      locale={locale}
      header={layout}
      fontFamily={getCvFontStack(font)}
    />
  );
}
