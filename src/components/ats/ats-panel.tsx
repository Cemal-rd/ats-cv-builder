"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtsReport } from "@/hooks/use-ats-report";
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
  const sortedChecks = [...report.checks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const stats = [
    { label: "Madde", value: report.stats.bulletCount },
    { label: "Aksiyon fiili", value: `%${Math.round(report.stats.actionVerbRatio * 100)}` },
    { label: "Ölçülebilir", value: `%${Math.round(report.stats.quantifiedRatio * 100)}` },
    { label: "Kelime", value: report.stats.wordCount },
  ];

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-4 sm:flex-row">
          <ScoreGauge score={report.score} />
          <div className="w-full flex-1 space-y-3">
            <div>
              <p className={cn("text-sm font-semibold", tone.text)}>{tone.label}</p>
              <p className="text-xs text-muted-foreground">
                Skor siz yazdıkça güncellenir. Kırmızı ve sarı maddelerden başlayın.
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
          <CardTitle>Kontrol listesi</CardTitle>
          <CardDescription>Her kontrol toplam skora ağırlığı oranında katkı sağlar.</CardDescription>
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
  const { icon: Icon, className } = STATUS_ICON[check.status];
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", className)} aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium">{check.label}</p>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {check.maxScore > 0 ? `${check.score}/${check.maxScore}` : "bilgi"}
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
