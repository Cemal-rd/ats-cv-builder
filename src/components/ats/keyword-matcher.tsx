"use client";

import { useDeferredValue, useMemo } from "react";
import { Check, Eraser, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { matchKeywords } from "@/lib/ats/keywords";
import { resumeToPlainText } from "@/lib/resume/format";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/resume-store";
import { scoreTone } from "./score-gauge";

const MIN_JOB_TEXT_LENGTH = 40;

export function KeywordMatcher() {
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const setJobDescription = useResumeStore((s) => s.setJobDescription);
  const resume = useResumeStore((s) => s.resume);

  const deferredJob = useDeferredValue(jobDescription);
  const deferredResume = useDeferredValue(resume);

  const result = useMemo(
    () =>
      deferredJob.trim().length >= MIN_JOB_TEXT_LENGTH
        ? matchKeywords(deferredJob, resumeToPlainText(deferredResume))
        : null,
    [deferredJob, deferredResume],
  );

  const missing = result?.keywords.filter((k) => !k.matched) ?? [];
  const matched = result?.keywords.filter((k) => k.matched) ?? [];
  const tone = result ? scoreTone(result.percentage) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>İş ilanı eşleştirme</CardTitle>
        <CardDescription>
          Hedeflediğiniz ilanın metnini yapıştırın; öne çıkan anahtar kelimeler CV&apos;nizle karşılaştırılır.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            aria-label="İş ilanı metni"
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="İş ilanı metnini buraya yapıştırın…"
          />
          {jobDescription && (
            <Button variant="ghost" size="sm" onClick={() => setJobDescription("")}>
              <Eraser />
              Temizle
            </Button>
          )}
        </div>

        {!result && (
          <p className="text-xs text-muted-foreground">
            Analiz için en az {MIN_JOB_TEXT_LENGTH} karakterlik bir ilan metni girin.
          </p>
        )}

        {result && tone && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">Eşleşme oranı</span>
                <span className={cn("font-semibold tabular-nums", tone.text)}>%{result.percentage}</span>
              </div>
              <Progress
                value={result.percentage}
                indicatorClassName={cn(
                  result.percentage >= 80 ? "bg-success" : result.percentage >= 60 ? "bg-warning" : "bg-destructive",
                )}
              />
              <p className="text-xs text-muted-foreground">
                {result.keywords.length} anahtar kelimeden {result.matchedCount} tanesi CV&apos;nizde geçiyor.
              </p>
            </div>

            {missing.length > 0 && (
              <KeywordGroup title="Eksik anahtar kelimeler" hint="Gerçekten sahip olduğunuz yetkinlikleri, ilandaki yazımla ekleyin.">
                {missing.map((k) => (
                  <Badge key={k.term} variant="destructive">
                    <X className="h-3 w-3" />
                    {k.term}
                  </Badge>
                ))}
              </KeywordGroup>
            )}

            {matched.length > 0 && (
              <KeywordGroup title="Eşleşenler">
                {matched.map((k) => (
                  <Badge key={k.term} variant="success">
                    <Check className="h-3 w-3" />
                    {k.term}
                  </Badge>
                ))}
              </KeywordGroup>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KeywordGroup({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs font-semibold">{title}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
