import { resumeToPlainText, toBullets } from "@/lib/resume/format";
import { countWords } from "@/lib/utils";
import type { Resume, ResumeLocale } from "@/lib/schema/resume";
import { findWeakPhrase, hasActionVerb } from "./action-verbs";
import { ATS_RULES } from "./rules";
import type { AnalyzedBullet, AtsContext, AtsReport, AtsRule } from "./types";

const NUMBER_PATTERN = /\d/;

function analyzeBullet(text: string, source: string): AnalyzedBullet {
  return {
    text,
    source,
    wordCount: countWords(text),
    hasActionVerb: hasActionVerb(text),
    isQuantified: NUMBER_PATTERN.test(text),
    weakPhrase: findWeakPhrase(text),
  };
}

function buildContext(resume: Resume, locale: ResumeLocale): AtsContext {
  const bullets = [
    ...resume.experience.flatMap((e) =>
      toBullets(e.description).map((b) => analyzeBullet(b, e.position || e.company)),
    ),
    ...resume.projects.flatMap((p) => toBullets(p.description).map((b) => analyzeBullet(b, p.name))),
  ];
  return { resume, locale, bullets };
}

export function analyzeResume(
  resume: Resume,
  locale: ResumeLocale = "tr",
  rules: readonly AtsRule[] = ATS_RULES,
): AtsReport {
  const context = buildContext(resume, locale);
  const checks = rules.map((rule) => {
    const result = rule.evaluate(context);
    return {
      id: rule.id,
      label: rule.label,
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
