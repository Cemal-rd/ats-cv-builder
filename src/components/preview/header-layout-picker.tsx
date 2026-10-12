"use client";

import { PanelTop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { getPhoto } from "@/lib/resume/format";
import type { HeaderLayout } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";

const ALIGN_OPTIONS = [
  { value: "auto", label: "Şablona göre" },
  { value: "left", label: "Sol" },
  { value: "center", label: "Orta" },
] as const satisfies readonly { value: HeaderLayout["align"]; label: string }[];

const PHOTO_OPTIONS = [
  { value: "auto", label: "Şablona göre" },
  { value: "left", label: "Sol" },
  { value: "right", label: "Sağ" },
] as const satisfies readonly { value: HeaderLayout["photo"]; label: string }[];

/** CV başlığında isim hizası ve fotoğraf konumu. */
export function HeaderLayoutPicker() {
  const header = useResumeStore((s) => s.header);
  const setHeader = useResumeStore((s) => s.setHeader);
  const hasPhoto = useResumeStore((s) => Boolean(getPhoto(s.resume.personal)));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" aria-label="Başlık düzeni">
          <PanelTop />
          <span className="hidden sm:inline">Başlık</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Ad soyad hizası</p>
          <SegmentedControl<HeaderLayout["align"]>
            ariaLabel="Ad soyad hizası"
            value={header.align}
            options={ALIGN_OPTIONS}
            onChange={(align) => setHeader({ align })}
            className="flex w-full"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Fotoğraf konumu</p>
          <SegmentedControl<HeaderLayout["photo"]>
            ariaLabel="Fotoğraf konumu"
            value={header.photo}
            options={PHOTO_OPTIONS}
            onChange={(photo) => setHeader({ photo })}
            className="flex w-full"
          />
          {!hasPhoto && (
            <p className="text-[11px] text-muted-foreground">
              Fotoğraf eklenmediği için etkisi yok (Kişisel Bilgiler → Profil fotoğrafı).
            </p>
          )}
        </div>
        <p className="border-t pt-2 text-[11px] leading-relaxed text-muted-foreground">
          ATS açısından fark etmez; metin sırası değişmez. Sola hizalı başlık en yaygın düzendir. Türkiye&apos;de
          fotoğraf genellikle sol ya da sağ üst köşede yer alır.
        </p>
      </PopoverContent>
    </Popover>
  );
}
