import { Fragment } from "react";
import { linkLabel, toHref, type ContactItem, type FilledSections } from "@/lib/resume/format";
import { customSectionIdFromKey, isCustomSectionKey, resolveSectionOrder } from "@/lib/resume/sections";
import type { BuiltinSectionKey, Resume } from "@/lib/schema/resume";
import { cn } from "@/lib/utils";
import type { ResolvedHeaderLayout } from "./types";

/**
 * CV içindeki bağlantı: metin rengini korur (CV'nin görünümü değişmez), önizlemede yeni
 * sekmede açılır, PDF'te tıklanabilir kalır. ATS'ler metni düz metin olarak okur.
 */
export function ResumeLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:underline">
      {children}
    </a>
  );
}

/** Web adresini bağlantı olarak gösterir: platformsa adıyla ("GitHub"), kişisel siteyse adresiyle. */
export function UrlLink({ url }: { url: string }) {
  return <ResumeLink href={toHref(url)}>{linkLabel(url)}</ResumeLink>;
}

/**
 * İletişim satırı: e-posta, telefon, LinkedIn ve web sitesi tıklanabilir.
 * Her öğe bölünmez (whitespace-nowrap): uzun satır yalnızca ayraçlardan alt satıra geçer;
 * aksi hâlde "github.com/ad-soyad" kısa çizgiden bölünüyor, ATS adresi iki parça okuyordu.
 */
export function ContactLine({ items, separator, className }: { items: ContactItem[]; separator: string; className?: string }) {
  return (
    <p className={className}>
      {items.map((item, i) => (
        <Fragment key={`${item.text}-${i}`}>
          {i > 0 && separator}
          <span className="whitespace-nowrap">
            {item.href ? <ResumeLink href={item.href}>{item.text}</ResumeLink> : item.text}
          </span>
        </Fragment>
      ))}
    </p>
  );
}

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
