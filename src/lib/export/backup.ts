import {
  parseResumeData,
  RESUME_LOCALES,
  resumeSettingsSchema,
  type Resume,
  type ResumeSettings,
  type ResumeVersions,
} from "@/lib/schema/resume";

const BACKUP_APP_ID = "ats-cv-builder";
const BACKUP_VERSION = 2;

export interface ResumeBackup {
  app: typeof BACKUP_APP_ID;
  version: number;
  exportedAt: string;
  settings: ResumeSettings;
  /** Aktif sürüm (v1 yedeklerle geriye dönük uyumluluk için). */
  resume: Resume;
  /** Tüm dil sürümleri. */
  versions: ResumeVersions;
}

export type ImportResult =
  | { ok: true; resume: Resume; versions?: ResumeVersions; settings?: Partial<ResumeSettings> }
  | { ok: false; error: string };

export function createBackup(resume: Resume, versions: ResumeVersions, settings: ResumeSettings): ResumeBackup {
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    resume,
    versions,
  };
}

export function downloadJson(data: unknown, fileName: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = Object.assign(document.createElement("a"), { href: url, download: fileName });
  anchor.click();
  URL.revokeObjectURL(url);
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

/** Uygulamanın yedek formatını (v1/v2) ve çıplak bir Resume JSON'unu kabul eder. */
export async function parseBackupFile(file: File): Promise<ImportResult> {
  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    return { ok: false, error: "Dosya geçerli bir JSON değil." };
  }

  if (isRecord(json) && json.app === BACKUP_APP_ID) {
    const resume = parseResumeData(json.resume);
    if (!resume) return { ok: false, error: "Yedekteki CV verisi okunamadı." };

    const versions: ResumeVersions = {};
    if (isRecord(json.versions)) {
      for (const locale of RESUME_LOCALES) {
        const version = parseResumeData(json.versions[locale]);
        if (version) versions[locale] = version;
      }
    }
    const settings = resumeSettingsSchema.partial().safeParse(json.settings);
    return {
      ok: true,
      resume,
      versions: Object.keys(versions).length ? versions : undefined,
      settings: settings.success ? settings.data : undefined,
    };
  }

  const raw = parseResumeData(json);
  if (raw) return { ok: true, resume: raw };

  return { ok: false, error: "Dosya yapısı tanınmadı. Bu uygulamadan alınmış bir yedek seçin." };
}
