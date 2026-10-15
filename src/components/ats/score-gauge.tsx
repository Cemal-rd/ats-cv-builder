"use client";

import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Skora göre renk ve etiket anahtarı (etiket metni: i18n → ats.tone). */
export function scoreTone(score: number) {
  if (score >= 80) return { text: "text-success", key: "strong" } as const;
  if (score >= 60) return { text: "text-warning", key: "improvable" } as const;
  return { text: "text-destructive", key: "weak" } as const;
}

export function ScoreGauge({ score, className }: { score: number; className?: string }) {
  const { t } = useI18n();
  const tone = scoreTone(score);
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className={cn("relative h-28 w-28 shrink-0", className)} role="img" aria-label={t.ats.gaugeAria(score)}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-500", tone.text)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{score}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
