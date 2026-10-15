import { resumeToPlainText, toBullets } from "@/lib/resume/format";
import { countWords } from "@/lib/utils";
import { MESSAGES, type Messages } from "@/i18n";
import type { Resume, ResumeLocale } from "@/lib/schema/resume";
import { findWeakPhrase, hasActionVerb } from "./action-verbs";
import { ATS_RULES } from "./rules";
import type { AnalyzedBullet, AtsContext, AtsReport, AtsRule } from "./types";

const NUMBER_PATTERN = /\d/;

function analyzeBullet(text: string, source: string, position: number): AnalyzedBullet {
  return {
    text,
    source,
    position,
    wordCount: countWords(text),
    hasActionVerb: hasActionVerb(text),
    isQuantified: NUMBER_PATTERN.test(text),
    weakPhrase: findWeakPhrase(text),
  };
}

function buildContext(resume: Resume, locale: ResumeLocale, t: Messages["ats"]): AtsContext {
  const bullets = [
    ...resume.experience.flatMap((e) =>
      toBullets(e.description).map((b, i) => analyzeBullet(b, e.position || e.company, i + 1)),
    ),
    ...resume.projects.flatMap((p) => toBullets(p.description).map((b, i) => analyzeBullet(b, p.name, i + 1))),
  ];
  return { resume, locale, bullets, t: t.rules };
}

export function analyzeResume(
  resume: Resume,
  locale: ResumeLocale = "tr",
  /** Arayüz dilindeki ATS metinleri (kural adları, mesajlar, ipuçları). */
  t: Messages["ats"] = MESSAGES.tr.ats,
  rules: readonly AtsRule[] = ATS_RULES,
): AtsReport {
  const context = buildContext(resume, locale, t);
  const checks = rules.map((rule) => {
    const result = rule.evaluate(context);
    return {
      id: rule.id,
      label: t.labels[rule.id],
      maxScore: rule.maxScore,
      ...result,
      score: Math.max(0, Math.min(rule.maxScore, result.score)),
    };
  });

  const maxTotal = rules.reduce((sum, r) => sum + r.maxScore, 0) || 1;
  const earned = checks.reduce((sum, c) => sum + c.score, 0);
  const { bullets } = context;
  const ratio = (n: number) => (bullets.length ? n / bullets.length : 0);

  return {
    score: Math.round((earned / maxTotal) * 100),
    checks,
    stats: {
      bulletCount: bullets.length,
      actionVerbRatio: ratio(bullets.filter((b) => b.hasActionVerb).length),
      quantifiedRatio: ratio(bullets.filter((b) => b.isQuantified).length),
      wordCount: countWords(resumeToPlainText(resume)),
    },
  };
}
