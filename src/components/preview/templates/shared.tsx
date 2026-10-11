import { Fragment } from "react";
import type { FilledSections } from "@/lib/resume/format";
import { customSectionIdFromKey, isCustomSectionKey, resolveSectionOrder } from "@/lib/resume/sections";
import type { BuiltinSectionKey, Resume } from "@/lib/schema/resume";

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
