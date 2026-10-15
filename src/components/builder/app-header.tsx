"use client";

import { useRef, type ChangeEvent } from "react";
import { FileDown, FileText, FileUp, Save } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { scoreTone } from "@/components/ats/score-gauge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAtsReport } from "@/hooks/use-ats-report";
import { UI_LOCALE_STORAGE_KEY, uiLocalePath } from "@/i18n";
import { useI18n } from "@/i18n/provider";
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
  const { t, locale: uiLocale } = useI18n();
  const otherUiLocale = uiLocale === "tr" ? "en" : "tr";

  const handleExportJson = () => {
    const { resume, versions, template, font, header, locale } = useResumeStore.getState();
    downloadJson(
      createBackup(resume, versions, { template, font, header, locale }),
      `${buildFileName(resume.personal.fullName)}.json`,
    );
    toast.success(t.header.backupDownloaded, { description: t.header.backupDownloadedDesc });
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const result = await parseBackupFile(file);
    if (!result.ok) {
      toast.error(t.header.importFailed, { description: t.backup.errors[result.error] });
      return;
    }
    const { setTemplate, setLocale, setVersions, locale: currentLocale } = useResumeStore.getState();
    const locale = result.settings?.locale ?? currentLocale;
    if (result.settings?.template) setTemplate(result.settings.template);
    if (result.settings?.font) useResumeStore.getState().setFont(result.settings.font);
    if (result.settings?.header) useResumeStore.getState().setHeader(result.settings.header);
    setLocale(locale);
    setVersions(result.versions ?? { [locale]: result.resume });
    replaceResume(result.versions?.[locale] ?? result.resume);
    toast.success(t.header.imported);
  };

  const handleDownloadPdf = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.warning(t.header.formHasErrors, { description: t.header.formHasErrorsDesc });
    }
    toast.info(t.header.savePdf, { description: t.header.savePdfDesc });
    // Toast'ın çizilmesine izin ver; window.print() ana iş parçacığını bloklar.
    setTimeout(() => printResume(buildFileName(form.getValues("personal.fullName"))), 150);
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground sm:grid">
          <FileText className="h-4 w-4" />
        </span>
        {/* Sitenin ne olduğu ilk bakışta anlaşılsın: ad + tek cümlelik açıklama. */}
        <div className="min-w-0 leading-tight">
          <h1 className="truncate text-sm font-semibold tracking-tight">
            <span className="sm:hidden">{t.header.appNameShort}</span>
            <span className="hidden sm:inline">{t.header.appName}</span>
          </h1>
          <p className="hidden truncate text-[11px] text-muted-foreground lg:block">
            {t.header.tagline}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onScoreClick}
        className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent"
        aria-label={t.header.scoreAria(score)}
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
        <Button variant="ghost" size="sm" className="px-2 sm:px-3" onClick={() => fileInputRef.current?.click()} aria-label={t.header.importAria}>
          <FileUp />
          <span className="hidden md:inline">{t.header.import}</span>
        </Button>
        <Button variant="ghost" size="sm" className="px-2 sm:px-3" onClick={handleExportJson} aria-label={t.header.backupAria}>
          <Save />
          <span className="hidden md:inline">{t.header.backup}</span>
        </Button>
        <Button size="sm" className="px-2 sm:px-3" onClick={handleDownloadPdf}>
          <FileDown />
          <span className="hidden sm:inline">{t.header.downloadPdf}</span>
        </Button>
        <Button variant="ghost" size="sm" className="px-2 font-semibold" asChild>
          <a
            href={uiLocalePath(otherUiLocale)}
            hrefLang={otherUiLocale}
            aria-label={t.header.switchLanguageAria}
            onClick={() => {
              try {
                localStorage.setItem(UI_LOCALE_STORAGE_KEY, otherUiLocale);
              } catch {
                // Gizli pencere vb. — tercih kaydedilemese de bağlantı çalışır.
              }
            }}
          >
            {t.header.switchLanguage}
          </a>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
