"use client";

import { useLayoutEffect, useState } from "react";
import { useElementSize } from "@/hooks/use-element-size";
import { PAGE_HEIGHT_PX, paginate } from "@/lib/resume/pagination";
import { useResumeStore } from "@/store/resume-store";
import { TemplateRenderer } from "./templates";

/** 210mm @ 96dpi */
const A4_WIDTH_PX = 794;

/**
 * A4 sayfayı kapsayıcı genişliğine sığacak şekilde ölçekler ve PDF'teki
 * sayfa sonlarını simüle eder (bkz. lib/resume/pagination.ts).
 */
export function ResumePreview() {
  const resume = useResumeStore((s) => s.resume);
  const template = useResumeStore((s) => s.template);
  const locale = useResumeStore((s) => s.locale);
  const font = useResumeStore((s) => s.font);
  const header = useResumeStore((s) => s.header);

  const container = useElementSize<HTMLDivElement>();
  const page = useElementSize<HTMLDivElement>();
  const [pageCount, setPageCount] = useState(1);

  // Her değişiklikten sonra (ve web yazı tipleri yüklenince) sayfa sonlarını yeniden hesapla.
  useLayoutEffect(() => {
    const root = page.ref.current;
    if (!root) return;
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const article = root.querySelector("article");
        // Gizliyken (mobilde başka sekme) ölçüm yapılamaz; görünür olunca container.width değişir ve tekrar çalışır.
        if (article && root.offsetParent !== null) setPageCount(paginate(article).pageCount);
      });
    };
    run();
    document.fonts?.addEventListener("loadingdone", run);
    return () => {
      cancelAnimationFrame(frame);
      document.fonts?.removeEventListener("loadingdone", run);
    };
  }, [resume, template, locale, font, header, container.width, page.ref]);

  const scale = container.width ? Math.min(1, container.width / A4_WIDTH_PX) : 1;
  const paperHeight = Math.max(page.height, pageCount * PAGE_HEIGHT_PX);

  return (
    <div ref={container.ref} className="w-full">
      <div className="mx-auto" style={{ width: A4_WIDTH_PX * scale, height: paperHeight * scale }}>
        <div
          ref={page.ref}
          aria-label="CV önizlemesi"
          className="relative origin-top-left bg-white shadow-xl ring-1 ring-black/5"
          style={{ width: A4_WIDTH_PX, minHeight: pageCount * PAGE_HEIGHT_PX, transform: `scale(${scale})` }}
        >
          <TemplateRenderer resume={resume} template={template} font={font} header={header} locale={locale} />
          {Array.from({ length: pageCount - 1 }, (_, i) => (
            <PageBreakMarker key={i} top={(i + 1) * PAGE_HEIGHT_PX} page={i + 2} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {pageCount} sayfa{pageCount > 1 && " · Sayfa sonları PDF'teki ile aynı yerde gösterilir."}
      </p>
    </div>
  );
}

function PageBreakMarker({ top, page }: { top: number; page: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0" style={{ top: top - 6 }}>
      {/* Sayfalar arası boşluğu, kâğıt ayrımı gibi gösterir. */}
      <div className="h-3 bg-gradient-to-b from-neutral-200/0 via-neutral-300/70 to-neutral-200/0" />
      <span className="absolute right-2 top-3 rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
        Sayfa {page}
      </span>
    </div>
  );
}
