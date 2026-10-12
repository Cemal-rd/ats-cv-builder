import type { HeaderLayout, Resume, ResumeLocale, TemplateId } from "@/lib/schema/resume";

/** Başlığın çözümlenmiş düzeni ("auto" değerleri şablon varsayılanına çevrilmiş hâli). */
export interface ResolvedHeaderLayout {
  align: "left" | "center";
  photoSide: "left" | "right";
}

export interface TemplateProps {
  resume: Resume;
  locale: ResumeLocale;
  header: ResolvedHeaderLayout;
  /** Kullanıcının seçtiği CSS font yığını; yoksa şablonun varsayılanı. */
  fontFamily?: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  /** Kullanıcı "Şablona göre" seçtiğinde kullanılan başlık düzeni. */
  defaultHeader: (hasPhoto: boolean) => ResolvedHeaderLayout;
  component: React.ComponentType<TemplateProps>;
}

export function resolveHeaderLayout(
  layout: HeaderLayout,
  template: TemplateDefinition,
  hasPhoto: boolean,
): ResolvedHeaderLayout {
  const fallback = template.defaultHeader(hasPhoto);
  return {
    align: layout.align === "auto" ? fallback.align : layout.align,
    photoSide: layout.photo === "auto" ? fallback.photoSide : layout.photo,
  };
}
