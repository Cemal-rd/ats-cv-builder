"use client";

import { PanelTop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useI18n } from "@/i18n/provider";
import { getPhoto } from "@/lib/resume/format";
import type { HeaderLayout } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";

const ALIGN_VALUES = ["auto", "left", "center"] as const satisfies readonly HeaderLayout["align"][];
const PHOTO_VALUES = ["auto", "left", "right"] as const satisfies readonly HeaderLayout["photo"][];

/** CV başlığında isim hizası ve fotoğraf konumu. */
export function HeaderLayoutPicker() {
  const header = useResumeStore((s) => s.header);
  const setHeader = useResumeStore((s) => s.setHeader);
  const hasPhoto = useResumeStore((s) => Boolean(getPhoto(s.resume.personal)));
  const { t } = useI18n();
  const h = t.headerLayout;
  const alignOptions = ALIGN_VALUES.map((value) => ({ value, label: h[value] }));
  const photoOptions = PHOTO_VALUES.map((value) => ({ value, label: h[value] }));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" aria-label={h.aria}>
          <PanelTop />
          <span className="hidden sm:inline">{h.button}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium">{h.align}</p>
          <SegmentedControl<HeaderLayout["align"]>
            ariaLabel={h.align}
            value={header.align}
            options={alignOptions}
            onChange={(align) => setHeader({ align })}
            className="flex w-full"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">{h.photo}</p>
          <SegmentedControl<HeaderLayout["photo"]>
            ariaLabel={h.photo}
            value={header.photo}
            options={photoOptions}
            onChange={(photo) => setHeader({ photo })}
            className="flex w-full"
          />
          {!hasPhoto && (
            <p className="text-[11px] text-muted-foreground">
              {h.noPhoto}
            </p>
          )}
        </div>
        <p className="border-t pt-2 text-[11px] leading-relaxed text-muted-foreground">
          {h.note}
        </p>
      </PopoverContent>
    </Popover>
  );
}
