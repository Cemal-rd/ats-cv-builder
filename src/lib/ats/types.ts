import type { Resume, ResumeLocale } from "@/lib/schema/resume";

export type CheckStatus = "pass" | "warn" | "fail";

export interface AnalyzedBullet {
  text: string;
  /** Hangi kayda ait olduğu (ör. pozisyon adı) — ipuçlarında kullanılır. */
  source: string;
  wordCount: number;
  hasActionVerb: boolean;
  isQuantified: boolean;
  weakPhrase?: string;
}

export interface AtsContext {
  resume: Resume;
  /** Aktif CV dili; uluslararası uyum kontrolleri için. */
  locale: ResumeLocale;
  bullets: AnalyzedBullet[];
}

export interface RuleResult {
  status: CheckStatus;
  score: number;
  message: string;
  tips: string[];
}

export interface AtsRule {
  id: string;
  label: string;
  /** 0 ise kural yalnızca bilgilendirme amaçlıdır, skoru etkilemez. */
  maxScore: number;
  evaluate: (context: AtsContext) => RuleResult;
}

export interface AtsCheck extends RuleResult {
  id: string;
  label: string;
  maxScore: number;
}

export interface AtsStats {
  bulletCount: number;
  actionVerbRatio: number;
  quantifiedRatio: number;
  wordCount: number;
}

export interface AtsReport {
  score: number;
  checks: AtsCheck[];
  stats: AtsStats;
}
