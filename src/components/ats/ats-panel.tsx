"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtsReport } from "@/hooks/use-ats-report";
import { useI18n } from "@/i18n/provider";
import type { AtsCheck, CheckStatus } from "@/lib/ats/types";
import { cn } from "@/lib/utils";
import { KeywordMatcher } from "./keyword-matcher";
import { ScoreGauge, scoreTone } from "./score-gauge";

const STATUS_ICON: Record<CheckStatus, { icon: typeof CheckCircle2; className: string }> = {
  pass: { icon: CheckCircle2, className: "text-success" },
  warn: { icon: AlertTriangle, className: "text-warning" },
  fail: { icon: XCircle, className: "text-destructive" },
};

const STATUS_ORDER: Record<CheckStatus, number> = { fail: 0, warn: 1, pass: 2 };

export function AtsPanel() {
  const report = useAtsReport();
  const tone = scoreTone(report.score);
  const { t } = useI18n();
  const sortedChecks = [...report.checks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const stats = [
    { label: t.ats.stats.bullets, value: report.stats.bulletCount },
    { label: t.ats.stats.actionVerbs, value: t.ats.percent(Math.round(report.stats.actionVerbRatio * 100)) },
    { label: t.ats.stats.quantified, value: t.ats.percent(Math.round(report.stats.quantifiedRatio * 100)) },
    { label: t.ats.stats.words, value: report.stats.wordCount },
  ];

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-4 sm:flex-row">
          <ScoreGauge score={report.score} />
          <div className="w-full flex-1 space-y-3">
            <div>
              <p className={cn("text-sm font-semibold", tone.text)}>{t.ats.tone[tone.key]}</p>
              <p className="text-xs text-muted-foreground">
                {t.ats.liveHint}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {stats.map((s) => (
                <div key={s.label} className="rounded-md bg-muted px-2 py-1.5 text-center">
                  <p className="text-sm font-semibold tabular-nums">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.ats.checklist}</CardTitle>
          <CardDescription>{t.ats.checklistDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {sortedChecks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </ul>
        </CardContent>
      </Card>

      <KeywordMatcher />
    </div>
  );
}

function CheckRow({ check }: { check: AtsCheck }) {
  const { t } = useI18n();
  const { icon: Icon, className } = STATUS_ICON[check.status];
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", className)} aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium">{check.label}</p>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {check.maxScore > 0 ? `${check.score}/${check.maxScore}` : t.ats.info}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{check.message}</p>
        {check.tips.length > 0 && (
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-foreground/80">
            {check.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
