"use client";

import { useRef, type ChangeEvent } from "react";
import { FileDown, FileText, FileUp, Save } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { scoreTone } from "@/components/ats/score-gauge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAtsReport } from "@/hooks/use-ats-report";
import { useReplaceResume } from "@/hooks/use-replace-resume";
import { createBackup, downloadJson, parseBackupFile } from "@/lib/export/backup";
import { printResume } from "@/lib/export/print";
import { buildFileName } from "@/lib/resume/format";
import type { Resume } from "@/lib/schema/resume";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/resume-store";

interface AppHeaderProps {
  onScoreClick: () => void;
}

export function AppHeader({ onScoreClick }: AppHeaderProps) {
  const form = useFormContext<Resume>();
  const replaceResume = useReplaceResume();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { score } = useAtsReport();
  const tone = scoreTone(score);

  const handleExportJson = () => {
    const { resume, versions, template, locale } = useResumeStore.getState();
    downloadJson(
      createBackup(resume, versions, { template, locale }),
      `${buildFileName(resume.personal.fullName)}.json`,
    );
    toast.success("Yedek indirildi", { description: "JSON dosyasını daha sonra içe aktarabilirsiniz." });
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const result = await parseBackupFile(file);
    if (!result.ok) {
      toast.error("İçe aktarma başarısız", { description: result.error });
      return;
    }
    const { setTemplate, setLocale, setVersions, locale: currentLocale } = useResumeStore.getState();
    const locale = result.settings?.locale ?? currentLocale;
    if (result.settings?.template) setTemplate(result.settings.template);
    setLocale(locale);
    setVersions(result.versions ?? { [locale]: result.resume });
    replaceResume(result.versions?.[locale] ?? result.resume);
    toast.success("CV içe aktarıldı");
  };

  const handleDownloadPdf = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.warning("Bazı alanlarda hata var", { description: "PDF yine de oluşturuluyor; işaretli alanları kontrol edin." });
    }
    toast.info("PDF olarak kaydedin", {
      description: "Yazdırma penceresinde hedef olarak \"PDF olarak kaydet\"i seçin ve \"Üstbilgi ve altbilgi\"yi kapatın.",
    });
    // Toast'ın çizilmesine izin ver; window.print() ana iş parçacığını bloklar.
    setTimeout(() => printResume(buildFileName(form.getValues("personal.fullName"))), 150);
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <FileText className="h-4 w-4" />
        </span>
        <span className="hidden font-semibold tracking-tight sm:inline">ATS CV Builder</span>
      </div>

      <button
        type="button"
        onClick={onScoreClick}
        className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent"
        aria-label={`ATS skoru ${score}. Analizi aç`}
      >
        <span className={cn("h-2 w-2 rounded-full bg-current", tone.text)} />
        <span className="text-muted-foreground">ATS</span>
        <span className="font-semibold tabular-nums">{score}</span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImport}
        />
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} aria-label="JSON içe aktar">
          <FileUp />
          <span className="hidden md:inline">İçe aktar</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleExportJson} aria-label="JSON olarak yedekle">
          <Save />
          <span className="hidden md:inline">Yedekle</span>
        </Button>
        <Button size="sm" onClick={handleDownloadPdf}>
          <FileDown />
          <span className="hidden sm:inline">PDF indir</span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
