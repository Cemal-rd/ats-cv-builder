import { EMOJI_PATTERN, resumeToPlainText, splitList, toBullets } from "@/lib/resume/format";
import { countWords, hasText } from "@/lib/utils";
import type { AtsRule, CheckStatus } from "./types";

/*
 * Kurallar yalnızca hesaplama yapar; görünen bütün metinler arayüz diline göre
 * context.t'den gelir (src/i18n/messages → ats.rules).
 */

const IDEAL_BULLETS = { min: 3, max: 6 };
const BULLET_WORDS = { min: 6, max: 35 };
const ACTION_VERB_TARGET = 0.7;
const QUANTIFIED_TARGET = 0.4;

const ratioStatus = (ratio: number, passAt: number, warnAt: number): CheckStatus =>
  ratio >= passAt ? "pass" : ratio >= warnAt ? "warn" : "fail";

const percent = (ratio: number) => Math.round(ratio * 100);

const truncate = (text: string, max = 60) => (text.length > max ? `${text.slice(0, max)}…` : text);

/* -------------------------------------------------------------------------- */

const contactRule: AtsRule = {
  id: "contact",
  maxScore: 20,
  evaluate: ({ resume, t }) => {
    const p = resume.personal;
    const fields = [
      { label: t.contactFields.fullName, value: p.fullName, points: 4 },
      { label: t.contactFields.email, value: p.email, points: 5 },
      { label: t.contactFields.phone, value: p.phone, points: 4 },
      { label: t.contactFields.linkedin, value: p.linkedin, points: 4 },
      { label: t.contactFields.location, value: p.location, points: 3 },
    ];
    const missing = fields.filter((f) => !f.value.trim());
    const score = fields.filter((f) => f.value.trim()).reduce((sum, f) => sum + f.points, 0);

    return {
      score,
      status: missing.length === 0 ? "pass" : score >= 12 ? "warn" : "fail",
      message: missing.length === 0 ? t.contactComplete : t.contactMissing(missing.map((f) => f.label)),
      tips: missing.length ? [t.contactTip] : [],
    };
  },
};

const summaryRule: AtsRule = {
  id: "summary",
  maxScore: 10,
  evaluate: ({ resume, t }) => {
    const words = countWords(resume.summary);
    if (words === 0) {
      return { score: 0, status: "fail", message: t.summaryMissing, tips: [t.summaryMissingTip] };
    }
    if (words < 30) return { score: 5, status: "warn", message: t.summaryShort(words), tips: [] };
    if (words > 120) return { score: 6, status: "warn", message: t.summaryLong(words), tips: [t.summaryLongTip] };
    return { score: 10, status: "pass", message: t.summaryIdeal(words), tips: [] };
  },
};

const experienceRule: AtsRule = {
  id: "experience",
  maxScore: 15,
  evaluate: ({ resume, t }) => {
    const entries = resume.experience.filter((e) => hasText(e.position, e.company, e.description));
    if (entries.length === 0) {
      return { score: 0, status: "fail", message: t.experienceMissing, tips: [t.experienceMissingTip] };
    }
    const incomplete = entries.filter(
      (e) => !e.position.trim() || !e.company.trim() || !e.startDate.trim() || (!e.endDate.trim() && !e.current),
    );
    const ratio = (entries.length - incomplete.length) / entries.length;

    return {
      score: Math.round(15 * ratio),
      status: ratio === 1 ? "pass" : ratio >= 0.5 ? "warn" : "fail",
      message:
        incomplete.length === 0 ? t.experienceComplete(entries.length) : t.experienceIncomplete(incomplete.length),
      tips: incomplete.length ? [t.experienceDatesTip] : [],
    };
  },
};

const bulletDensityRule: AtsRule = {
  id: "bullets",
  maxScore: 15,
  evaluate: ({ resume, bullets, t }) => {
    const entries = resume.experience.filter((e) => hasText(e.position, e.company, e.description));
    if (bullets.length === 0 || entries.length === 0) {
      return { score: 0, status: "fail", message: t.bulletsMissing, tips: [t.bulletsMissingTip] };
    }

    const tips: string[] = [];
    const densityScores = entries.map((entry): number => {
      const count = toBullets(entry.description).length;
      if (count < IDEAL_BULLETS.min) {
        tips.push(t.tooFewBullets(entry.position || entry.company || t.aPosition, IDEAL_BULLETS.min));
      }
      if (count >= IDEAL_BULLETS.min && count <= IDEAL_BULLETS.max) return 1;
      if (count > 0 && count <= IDEAL_BULLETS.max + 2) return 0.5;
      return 0;
    });
    const density = densityScores.reduce((a, b) => a + b, 0) / entries.length;

    const longBullets = bullets.filter((b) => b.wordCount > BULLET_WORDS.max);
    const shortBullets = bullets.filter((b) => b.wordCount < BULLET_WORDS.min);
    const lengthRatio = (bullets.length - longBullets.length - shortBullets.length) / bullets.length;
    // Hangi madde olduğu görülsün: kayıt adı + sıra numarası + maddenin başı + kelime sayısı.
    const ref = (b: (typeof bullets)[number]) => t.bulletRef(b.source, b.position, truncate(b.text, 55), b.wordCount);
    longBullets.slice(0, 3).forEach((b) => tips.push(t.longBullet(ref(b))));
    shortBullets.slice(0, 3).forEach((b) => tips.push(t.shortBullet(ref(b))));
    const hidden = Math.max(0, longBullets.length - 3) + Math.max(0, shortBullets.length - 3);
    if (hidden) tips.push(t.moreBullets(hidden));

    const score = Math.round(density * 10 + lengthRatio * 5);
    return {
      score,
      status: score >= 13 ? "pass" : score >= 8 ? "warn" : "fail",
      message: t.bulletsSummary(bullets.length, IDEAL_BULLETS.min, IDEAL_BULLETS.max, BULLET_WORDS.min, BULLET_WORDS.max),
      tips,
    };
  },
};

const actionVerbRule: AtsRule = {
  id: "action-verbs",
  maxScore: 15,
  evaluate: ({ bullets, t }) => {
    if (bullets.length === 0) return { score: 0, status: "fail", message: t.noBullets, tips: [] };

    const ratio = bullets.filter((b) => b.hasActionVerb).length / bullets.length;
    const weak = [...new Set(bullets.map((b) => b.weakPhrase).filter((p): p is string => Boolean(p)))];
    const tips: string[] = [];
    if (weak.length) tips.push(t.weakPhrases(weak));
    bullets
      .filter((b) => !b.hasActionVerb)
      .slice(0, 2)
      .forEach((b) => tips.push(t.strengthen(b.source, b.position, truncate(b.text))));

    return {
      score: Math.round(15 * Math.min(1, ratio / ACTION_VERB_TARGET)),
      status: ratioStatus(ratio, ACTION_VERB_TARGET, 0.4),
      message: t.actionVerbRatio(percent(ratio), percent(ACTION_VERB_TARGET)),
      tips,
    };
  },
};

const quantifiedRule: AtsRule = {
  id: "quantified",
  maxScore: 10,
  evaluate: ({ bullets, t }) => {
    if (bullets.length === 0) return { score: 0, status: "fail", message: t.noBullets, tips: [] };
    const ratio = bullets.filter((b) => b.isQuantified).length / bullets.length;
    return {
      score: Math.round(10 * Math.min(1, ratio / QUANTIFIED_TARGET)),
      status: ratioStatus(ratio, QUANTIFIED_TARGET, 0.15),
      message: t.quantifiedRatio(percent(ratio), percent(QUANTIFIED_TARGET)),
      tips: ratio < QUANTIFIED_TARGET ? [t.quantifiedTip] : [],
    };
  },
};

const skillsRule: AtsRule = {
  id: "skills",
  maxScore: 10,
  evaluate: ({ resume, t }) => {
    const count = resume.skills.flatMap((s) => splitList(s.items)).length;
    if (count >= 8) return { score: 10, status: "pass", message: t.skillsGood(count), tips: [] };
    if (count >= 4) return { score: 6, status: "warn", message: t.skillsSome(count), tips: [t.skillsTip] };
    if (count >= 1) return { score: 3, status: "warn", message: t.skillsFew(count), tips: [t.skillsTip] };
    return { score: 0, status: "fail", message: t.skillsEmpty, tips: [t.skillsTip] };
  },
};

const educationRule: AtsRule = {
  id: "education",
  maxScore: 5,
  evaluate: ({ resume, t }) =>
    resume.education.some((e) => e.institution.trim())
      ? { score: 5, status: "pass", message: t.educationPresent, tips: [] }
      : { score: 0, status: "fail", message: t.educationMissing, tips: [t.educationTip] },
};

const emojiRule: AtsRule = {
  id: "emoji",
  maxScore: 5,
  evaluate: ({ resume, t }) => {
    const found = [...new Set(resumeToPlainText(resume).match(new RegExp(EMOJI_PATTERN.source, "gu")) ?? [])].filter(
      (char) => char.trim() && char !== "‍" && char !== "️",
    );
    if (found.length === 0) return { score: 5, status: "pass", message: t.emojiNone, tips: [] };
    return { score: 0, status: "warn", message: t.emojiFound(found.slice(0, 6).join(" ")), tips: [t.emojiTip] };
  },
};

/** Skoru etkilemez; fotoğraf, doğum tarihi gibi bölgesel tercihlere göre yönlendirir. */
const personalDataRule: AtsRule = {
  id: "personal-data",
  maxScore: 0,
  evaluate: ({ resume, locale, t }) => {
    const p = resume.personal;
    const hasPhoto = p.showPhoto && Boolean(p.photo);
    const tips: string[] = [];

    if (locale === "en") {
      if (hasPhoto) tips.push(t.photoInEnglish);
      if (p.birthDate.trim()) tips.push(t.birthDateInEnglish);
      if (p.militaryStatus.trim()) tips.push(t.militaryInEnglish);
    } else if (p.birthDate.trim()) {
      tips.push(t.birthDateOptional);
    }

    return {
      score: 0,
      status: tips.length ? "warn" : "pass",
      message: tips.length ? t.personalReview : hasPhoto ? t.photoAdvice : t.personalOk,
      tips,
    };
  },
};

/** Yeni bir kural eklemek için bu diziye eklemeniz yeterli; skor maxScore toplamına göre 100'e normalize edilir. */
export const ATS_RULES: readonly AtsRule[] = [
  contactRule,
  summaryRule,
  experienceRule,
  bulletDensityRule,
  actionVerbRule,
  quantifiedRule,
  skillsRule,
  educationRule,
  emojiRule,
  personalDataRule,
];
