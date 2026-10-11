"use client";

import { useElementSize } from "@/hooks/use-element-size";
import { useResumeStore } from "@/store/resume-store";
import { TemplateRenderer } from "./templates";

/** 210mm × 297mm @ 96dpi */
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

/**
 * A4 sayfayı kapsayıcı genişliğine sığacak şekilde ölçekler.
 * Ölçek transform ile uygulanır; bu yüzden dış kutunun boyutu elle ayarlanır.
 */
export function ResumePreview() {
  const resume = useResumeStore((s) => s.resume);
  const template = useResumeStore((s) => s.template);
  const locale = useResumeStore((s) => s.locale);

  const container = useElementSize<HTMLDivElement>();
  const page = useElementSize<HTMLDivElement>();

  const scale = container.width ? Math.min(1, container.width / A4_WIDTH_PX) : 1;
  const pageHeight = Math.max(page.height, A4_HEIGHT_PX);
  const pageCount = Math.ceil(pageHeight / A4_HEIGHT_PX - 0.02);

  return (
    <div ref={container.ref} className="w-full">
      <div className="mx-auto" style={{ width: A4_WIDTH_PX * scale, height: pageHeight * scale }}>
        <div
          ref={page.ref}
          aria-label="CV önizlemesi"
          className="relative origin-top-left shadow-xl ring-1 ring-black/5"
          style={{ width: A4_WIDTH_PX, transform: `scale(${scale})` }}
        >
          <TemplateRenderer resume={resume} template={template} locale={locale} />
          {Array.from({ length: pageCount - 1 }, (_, i) => (
            <PageBreakMarker key={i} top={(i + 1) * A4_HEIGHT_PX} page={i + 2} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {pageCount} sayfa · Sayfa sonları yaklaşık olarak gösterilir.
      </p>
    </div>
  );
}

function PageBreakMarker({ top, page }: { top: number; page: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-sky-400/70" style={{ top }}>
      <span className="absolute right-2 top-1 rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
        Sayfa {page}
      </span>
    </div>
  );
}
