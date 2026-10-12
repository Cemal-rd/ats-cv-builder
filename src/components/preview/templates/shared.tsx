import { Fragment } from "react";
import type { FilledSections } from "@/lib/resume/format";
import { customSectionIdFromKey, isCustomSectionKey, resolveSectionOrder } from "@/lib/resume/sections";
import type { BuiltinSectionKey, Resume } from "@/lib/schema/resume";
import { cn } from "@/lib/utils";
import type { ResolvedHeaderLayout } from "./types";

interface ResumeHeaderProps {
  layout: ResolvedHeaderLayout;
  photo: string | null;
  photoSize: string;
  photoClassName?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Şablonlardan bağımsız başlık yerleşimi: isim sola ya da ortaya, fotoğraf sola ya da sağa.
 * İsim ortadayken fotoğraf varsa üç sütunlu ızgara kullanılır; isim fotoğrafa göre
 * kaymaz, sayfanın tam ortasında kalır. Fotoğraf metin değildir; ATS okuma sırasını etkilemez.
 */
export function ResumeHeader({ layout, photo, photoSize, photoClassName, className, children }: ResumeHeaderProps) {
  const text = (
    <div className={cn("min-w-0 flex-1", layout.align === "center" ? "text-center" : "text-left")}>{children}</div>
  );
  if (!photo) return <header className={className}>{text}</header>;

  const image = <ResumePhoto src={photo} size={photoSize} className={cn("shrink-0", photoClassName)} />;
  const spacer = <span aria-hidden className="shrink-0" style={{ width: photoSize }} />;
  const [first, last] = layout.photoSide === "left" ? [image, layout.align === "center" ? spacer : null] : [layout.align === "center" ? spacer : null, image];

  return (
    <header className={cn("flex items-center gap-5", className)}>
      {first}
      {text}
      {last}
    </header>
  );
}

export type CustomSectionView = FilledSections["customSections"][number];

export interface SectionRenderers {
  builtin: Record<BuiltinSectionKey, () => React.ReactNode>;
  custom: (section: CustomSectionView) => React.ReactNode;
}

/** Bölümleri kullanıcının editörde belirlediği sırayla render eder. */
export function OrderedSections({
  resume,
  data,
  renderers,
}: {
  resume: Resume;
  data: FilledSections;
  renderers: SectionRenderers;
}) {
  return (
    <>
      {resolveSectionOrder(resume).map((key) => {
        if (isCustomSectionKey(key)) {
          const id = customSectionIdFromKey(key);
          const section = data.customSections.find((s) => s.id === id);
          return section ? <Fragment key={key}>{renderers.custom(section)}</Fragment> : null;
        }
        return <Fragment key={key}>{renderers.builtin[key]()}</Fragment>;
      })}
    </>
  );
}

/**
 * Fotoğraf metin akışının dışında, ayrı bir görsel olarak yer alır; ATS'ler
 * görseli yok sayar ve metin katmanı etkilenmez. alt boş: ekran okuyucu/ATS
 * için anlamlı bir metin taşımaz.
 */
export function ResumePhoto({ src, size = "28mm", className }: { src: string; size?: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- data URL; baskıda da görünmesi gerekir
    <img src={src} alt="" className={className} style={{ width: size, height: size, objectFit: "cover" }} />
  );
}
