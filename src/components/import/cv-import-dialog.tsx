"use client";

import { useRef, useState, type DragEvent } from "react";
import { AlertTriangle, Check, FileText, Loader2, Minus, ShieldCheck, Upload } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReplaceResume } from "@/hooks/use-replace-resume";
import { extractTextFromFile, IMPORT_ACCEPT, ImportError } from "@/lib/import/extract-text";
import { parseResumeText, type ResumeImportResult } from "@/lib/import/parse-resume-text";
import type { Resume } from "@/lib/schema/resume";
import { cn } from "@/lib/utils";

type Phase =
  | { name: "select"; error?: string }
  | { name: "loading"; fileName: string }
  | { name: "review"; fileName: string; result: ResumeImportResult; text: string };

interface CvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CvImportDialog({ open, onOpenChange }: CvImportDialogProps) {
  const [phase, setPhase] = useState<Phase>({ name: "select" });
  const { getValues } = useFormContext<Resume>();
  const replaceResume = useReplaceResume();

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setPhase({ name: "select" });
  };

  const processFile = async (file: File) => {
    setPhase({ name: "loading", fileName: file.name });
    try {
      const { text, warnings } = await extractTextFromFile(file);
      const result = parseResumeText(text);
      result.warnings.unshift(...warnings);
      setPhase({ name: "review", fileName: file.name, result, text });
    } catch (error) {
      setPhase({
        name: "select",
        error: error instanceof ImportError ? error.message : "Dosya işlenirken beklenmeyen bir hata oluştu.",
      });
    }
  };

  const applyImport = (result: ResumeImportResult) => {
    const previous = structuredClone(getValues());
    replaceResume(result.resume);
    handleOpenChange(false);
    toast.success("CV bilgileri forma aktarıldı", {
      description: "Otomatik ayrıştırma hatasız olmayabilir; lütfen alanları kontrol edin.",
      action: { label: "Geri al", onClick: () => replaceResume(previous) },
      duration: 8000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(phase.name === "review" && "max-w-2xl")}>
        <DialogHeader>
          <DialogTitle>Mevcut CV&apos;nden doldur</DialogTitle>
          <DialogDescription>
            PDF veya Word dosyanı yükle; bilgiler otomatik olarak forma aktarılsın.
          </DialogDescription>
        </DialogHeader>

        {phase.name === "select" && <FileDropZone error={phase.error} onFile={processFile} />}
        {phase.name === "loading" && (
          <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>
              <strong className="font-medium text-foreground">{phase.fileName}</strong> okunuyor…
            </span>
          </div>
        )}
        {phase.name === "review" && (
          <>
            <ImportReview fileName={phase.fileName} result={phase.result} text={phase.text} />
            <DialogFooter className="border-t pt-4">
              <Button variant="ghost" onClick={() => setPhase({ name: "select" })}>
                Başka dosya seç
              </Button>
              <Button onClick={() => applyImport(phase.result)}>Forma aktar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */

function FileDropZone({ error, onFile }: { error?: string; onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging ? "border-primary bg-accent" : "hover:bg-accent/50",
        )}
      >
        <Upload className="h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-medium">Dosyayı buraya sürükle veya seçmek için tıkla</p>
        <p className="text-xs text-muted-foreground">PDF, DOCX veya TXT · en fazla 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={IMPORT_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onFile(file);
          }}
        />
      </div>
      {error && (
        <p className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Dosyan cihazından çıkmaz; tüm işlem tarayıcında yapılır.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ImportReview({ fileName, result, text }: { fileName: string; result: ResumeImportResult; text: string }) {
  const { personal, summary } = result.resume;
  const fields = [
    { label: "Ad soyad", value: personal.fullName },
    { label: "Unvan", value: personal.title },
    { label: "E-posta", value: personal.email },
    { label: "Telefon", value: personal.phone },
    { label: "Konum", value: personal.location },
    { label: "LinkedIn", value: personal.linkedin },
    { label: "Web sitesi", value: personal.website },
    { label: "Özet", value: summary ? `${summary.split(/\s+/).length} kelime` : "" },
  ];
  const foundSections = result.sections.filter((s) => s.count > 0);
  const missingSections = result.sections.filter((s) => s.count === 0 && s.kind !== "custom");

  return (
    <div className="-mx-5 min-h-0 flex-1 space-y-4 overflow-y-auto px-5">
      <p className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="truncate font-medium">{fileName}</span>
      </p>

      {result.warnings.map((warning) => (
        <p key={warning} className="flex items-start gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {warning}
        </p>
      ))}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kişisel bilgiler</h3>
        <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex min-w-0 items-start gap-2 text-sm">
              <FoundIcon found={Boolean(value)} />
              <dt className="shrink-0 text-muted-foreground">{label}:</dt>
              <dd className={cn("truncate", !value && "text-muted-foreground")}>{value || "bulunamadı"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bölümler</h3>
        <ul className="space-y-2">
          {foundSections.map((section) => (
            <li key={`${section.kind}-${section.title}`} className="flex items-start gap-2 text-sm">
              <FoundIcon found />
              <div className="min-w-0">
                <p>
                  <span className="font-medium">{section.title}</span>{" "}
                  <span className="text-muted-foreground">
                    · {section.count} {section.kind === "skills" ? "yetenek" : "kayıt"}
                  </span>
                </p>
                {section.preview.map((line) => (
                  <p key={line} className="truncate text-xs text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>
            </li>
          ))}
          {missingSections.length > 0 && (
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <FoundIcon found={false} />
              Bulunamadı: {missingSections.map((s) => s.title).join(", ")}
            </li>
          )}
        </ul>
      </section>

      <details className="rounded-md border">
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium">
          Çıkarılan metni göster <span className="font-normal text-muted-foreground">(ATS&apos;lerin gördüğüne yakın)</span>
        </summary>
        <pre className="max-h-60 overflow-auto whitespace-pre-wrap border-t bg-muted/50 px-3 py-2 font-mono text-[11px] leading-relaxed">
          {text || "(metin yok)"}
        </pre>
      </details>

      <p className="text-xs text-muted-foreground">
        &quot;Forma aktar&quot; mevcut CV&apos;nin yerine geçer; aktarımdan sonra &quot;Geri al&quot; ile eski hâline
        dönebilirsin. Fotoğraf aktarılmaz.
      </p>
    </div>
  );
}

function FoundIcon({ found }: { found: boolean }) {
  return found ? (
    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-label="bulundu" />
  ) : (
    <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label="bulunamadı" />
  );
}
