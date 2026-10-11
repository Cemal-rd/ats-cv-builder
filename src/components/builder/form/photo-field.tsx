"use client";

import { useRef, type ChangeEvent } from "react";
import { ImagePlus, Trash2, UserRound } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resizeImageToDataUrl } from "@/lib/image/resize-image";
import type { Resume } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resume-store";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function PhotoField() {
  const { control, register, setValue } = useFormContext<Resume>();
  const [photo, showPhoto] = useWatch({ control, name: ["personal.photo", "personal.showPhoto"] });
  const locale = useResumeStore((s) => s.locale);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seçin.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Dosya 8 MB'tan büyük olamaz.");
      return;
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setValue("personal.photo", dataUrl, { shouldDirty: true });
      setValue("personal.showPhoto", true, { shouldDirty: true });
      toast.success("Fotoğraf eklendi");
    } catch {
      toast.error("Fotoğraf işlenemedi", { description: "Farklı bir dosya deneyin (JPG veya PNG)." });
    }
  };

  const removePhoto = () => {
    setValue("personal.photo", "", { shouldDirty: true });
    setValue("personal.showPhoto", false, { shouldDirty: true });
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed p-3 sm:col-span-2">
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md bg-muted">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL, next/image gereksiz
          <img src={photo} alt="Profil fotoğrafı önizlemesi" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-7 w-7 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium">Profil fotoğrafı (opsiyonel)</p>
          <p className="text-xs text-muted-foreground">
            Türkiye&apos;de yaygındır; ABD/İngiltere başvurularında önerilmez. ATS&apos;ler fotoğrafı okumaz, metin
            ayrıştırmayı da etkilemez.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <ImagePlus />
            {photo ? "Değiştir" : "Yükle"}
          </Button>
          {photo && (
            <>
              <Button variant="ghost" size="sm" onClick={removePhoto}>
                <Trash2 />
                Kaldır
              </Button>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-slate-900 dark:accent-slate-100"
                  {...register("personal.showPhoto")}
                />
                CV&apos;de göster
              </label>
            </>
          )}
        </div>
        {photo && showPhoto && locale === "en" && (
          <p className="text-xs text-warning">
            İngilizce sürümde fotoğraf gösteriliyor; uluslararası başvurular için gizlemeniz önerilir.
          </p>
        )}
      </div>
    </div>
  );
}
