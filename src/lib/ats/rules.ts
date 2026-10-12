import { EMOJI_PATTERN, resumeToPlainText, splitList, toBullets } from "@/lib/resume/format";
import { countWords, hasText } from "@/lib/utils";
import type { AnalyzedBullet, AtsRule, CheckStatus } from "./types";

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
  label: "İletişim bilgileri",
  maxScore: 20,
  evaluate: ({ resume }) => {
    const p = resume.personal;
    const fields = [
      { label: "Ad soyad", value: p.fullName, points: 4 },
      { label: "E-posta", value: p.email, points: 5 },
      { label: "Telefon", value: p.phone, points: 4 },
      { label: "LinkedIn", value: p.linkedin, points: 4 },
      { label: "Konum", value: p.location, points: 3 },
    ];
    const missing = fields.filter((f) => !f.value.trim());
    const score = fields.filter((f) => f.value.trim()).reduce((sum, f) => sum + f.points, 0);

    return {
      score,
      status: missing.length === 0 ? "pass" : score >= 12 ? "warn" : "fail",
      message:
        missing.length === 0
          ? "Tüm temel iletişim bilgileri mevcut."
          : `Eksik: ${missing.map((f) => f.label).join(", ")}.`,
      tips: missing.length
        ? ["ATS sistemleri aday profilini bu alanlardan otomatik oluşturur; eksik alanlar başvurunuzu zayıflatır."]
        : [],
    };
  },
};

const summaryRule: AtsRule = {
  id: "summary",
  label: "Profesyonel özet",
  maxScore: 10,
  evaluate: ({ resume }) => {
    const words = countWords(resume.summary);
    if (words === 0) {
      return {
        score: 0,
        status: "fail",
        message: "Profesyonel özet eksik.",
        tips: ["Hedef pozisyona özel 3–4 cümlelik bir özet ekleyin ve ilandaki anahtar kelimeleri kullanın."],
      };
    }
    if (words < 30) {
      return { score: 5, status: "warn", message: `Özet kısa (${words} kelime). 30–100 kelime önerilir.`, tips: [] };
    }
    if (words > 120) {
      return {
        score: 6,
        status: "warn",
        message: `Özet uzun (${words} kelime). 30–100 kelime önerilir.`,
        tips: ["İşe alım uzmanları özeti ortalama birkaç saniyede tarar; en güçlü 2–3 başarınıza odaklanın."],
      };
    }
    return { score: 10, status: "pass", message: `Özet uzunluğu ideal (${words} kelime).`, tips: [] };
  },
};

const experienceRule: AtsRule = {
  id: "experience",
  label: "İş deneyimi bütünlüğü",
  maxScore: 15,
  evaluate: ({ resume }) => {
    const entries = resume.experience.filter((e) => hasText(e.position, e.company, e.description));
    if (entries.length === 0) {
      return {
        score: 0,
        status: "fail",
        message: "İş deneyimi eklenmemiş.",
        tips: ["Staj, gönüllü çalışma veya serbest projeler de deneyim olarak eklenebilir."],
      };
    }
    const incomplete = entries.filter(
      (e) => !e.position.trim() || !e.company.trim() || !e.startDate.trim() || (!e.endDate.trim() && !e.current),
    );
    const ratio = (entries.length - incomplete.length) / entries.length;

    return {
      score: Math.round(15 * ratio),
      status: ratio === 1 ? "pass" : ratio >= 0.5 ? "warn" : "fail",
      message:
        incomplete.length === 0
          ? `${entries.length} deneyim kaydının tamamı eksiksiz.`
          : `${incomplete.length} kayıtta unvan, şirket veya tarih eksik.`,
      tips: incomplete.length
        ? ["ATS'ler toplam deneyim yılını tarihlerden hesaplar; başlangıç ve bitiş tarihlerini mutlaka girin."]
        : [],
    };
  },
};

const bulletDensityRule: AtsRule = {
  id: "bullets",
  label: "Madde yoğunluğu ve uzunluğu",
  maxScore: 15,
  evaluate: ({ resume, bullets }) => {
    const entries = resume.experience.filter((e) => hasText(e.position, e.company, e.description));
    if (bullets.length === 0 || entries.length === 0) {
      return {
        score: 0,
        status: "fail",
        message: "Deneyimlerde madde (bullet point) bulunamadı.",
        tips: ["Açıklama alanında her satıra bir başarı yazın; uygulama bunları otomatik madde işaretine çevirir."],
      };
    }

    const tips: string[] = [];
    const densityScores = entries.map((entry): number => {
      const count = toBullets(entry.description).length;
      if (count < IDEAL_BULLETS.min) {
        tips.push(`"${entry.position || entry.company || "Bir pozisyon"}" için en az ${IDEAL_BULLETS.min} madde yazın.`);
      }
      if (count >= IDEAL_BULLETS.min && count <= IDEAL_BULLETS.max) return 1;
      if (count > 0 && count <= IDEAL_BULLETS.max + 2) return 0.5;
      return 0;
    });
    const density = densityScores.reduce((a, b) => a + b, 0) / entries.length;

    const longBullets = bullets.filter((b) => b.wordCount > BULLET_WORDS.max);
    const shortBullets = bullets.filter((b) => b.wordCount < BULLET_WORDS.min);
    const lengthRatio = (bullets.length - longBullets.length - shortBullets.length) / bullets.length;
    // Hangi madde olduğu görülsün: kayıt adı + maddenin başı + kelime sayısı.
    const describe = (b: AnalyzedBullet) =>
      `${b.source ? `${b.source}, ` : ""}${b.position}. madde: "${truncate(b.text, 55)}" (${b.wordCount} kelime)`;
    longBullets.slice(0, 3).forEach((b) => tips.push(`Uzun madde, ikiye bölmeyi düşünün → ${describe(b)}`));
    shortBullets.slice(0, 3).forEach((b) => tips.push(`Kısa madde, bağlam ve sonuç ekleyin → ${describe(b)}`));
    const hidden = Math.max(0, longBullets.length - 3) + Math.max(0, shortBullets.length - 3);
    if (hidden) tips.push(`…ve ${hidden} madde daha.`);

    const score = Math.round(density * 10 + lengthRatio * 5);
    return {
      score,
      status: score >= 13 ? "pass" : score >= 8 ? "warn" : "fail",
      message: `Toplam ${bullets.length} madde. Pozisyon başına ${IDEAL_BULLETS.min}–${IDEAL_BULLETS.max} madde, madde başına ${BULLET_WORDS.min}–${BULLET_WORDS.max} kelime idealdir.`,
      tips,
    };
  },
};

const actionVerbRule: AtsRule = {
  id: "action-verbs",
  label: "Güçlü aksiyon fiilleri",
  maxScore: 15,
  evaluate: ({ bullets }) => {
    if (bullets.length === 0) {
      return { score: 0, status: "fail", message: "Analiz edilecek madde yok.", tips: [] };
    }
    const withVerb = bullets.filter((b) => b.hasActionVerb);
    const ratio = withVerb.length / bullets.length;
    const weak = [...new Set(bullets.map((b) => b.weakPhrase).filter((p): p is string => Boolean(p)))];
    const examples = bullets.filter((b) => !b.hasActionVerb).slice(0, 2);

    const tips: string[] = [];
    if (weak.length) {
      tips.push(`"${weak.join('", "')}" gibi pasif ifadeler yerine "geliştirdim", "yönettim", "Led", "Built" gibi fiiller kullanın.`);
    }
    examples.forEach((b) =>
      tips.push(`Güçlendirin → ${b.source ? `${b.source}, ` : ""}${b.position}. madde: "${truncate(b.text)}"`),
    );

    return {
      score: Math.round(15 * Math.min(1, ratio / ACTION_VERB_TARGET)),
      status: ratioStatus(ratio, ACTION_VERB_TARGET, 0.4),
      message: `Maddelerin %${percent(ratio)}'i güçlü bir aksiyon fiili içeriyor (hedef: %${percent(ACTION_VERB_TARGET)}+).`,
      tips,
    };
  },
};

const quantifiedRule: AtsRule = {
  id: "quantified",
  label: "Ölçülebilir sonuçlar",
  maxScore: 10,
  evaluate: ({ bullets }) => {
    if (bullets.length === 0) {
      return { score: 0, status: "fail", message: "Analiz edilecek madde yok.", tips: [] };
    }
    const ratio = bullets.filter((b) => b.isQuantified).length / bullets.length;
    return {
      score: Math.round(10 * Math.min(1, ratio / QUANTIFIED_TARGET)),
      status: ratioStatus(ratio, QUANTIFIED_TARGET, 0.15),
      message: `Maddelerin %${percent(ratio)}'i sayısal bir sonuç içeriyor (hedef: %${percent(QUANTIFIED_TARGET)}+).`,
      tips:
        ratio < QUANTIFIED_TARGET
          ? ["Etkiyi sayılarla gösterin: yüzde, süre, gelir, kullanıcı sayısı, ekip büyüklüğü (ör. \"%30 azalttım\")."]
          : [],
    };
  },
};

const skillsRule: AtsRule = {
  id: "skills",
  label: "Yetenekler",
  maxScore: 10,
  evaluate: ({ resume }) => {
    const count = resume.skills.flatMap((s) => splitList(s.items)).length;
    const tip = "Yetenekleri virgülle ayırıp kategorilere bölün; ilandaki teknik terimleri birebir aynı yazımla kullanın.";
    if (count >= 8) return { score: 10, status: "pass", message: `${count} yetenek listelenmiş.`, tips: [] };
    if (count >= 4) return { score: 6, status: "warn", message: `${count} yetenek var; en az 8 önerilir.`, tips: [tip] };
    if (count >= 1) return { score: 3, status: "warn", message: `Yalnızca ${count} yetenek var.`, tips: [tip] };
    return { score: 0, status: "fail", message: "Yetenek bölümü boş.", tips: [tip] };
  },
};

const educationRule: AtsRule = {
  id: "education",
  label: "Eğitim",
  maxScore: 5,
  evaluate: ({ resume }) => {
    const filled = resume.education.some((e) => e.institution.trim());
    return filled
      ? { score: 5, status: "pass", message: "Eğitim bilgisi mevcut.", tips: [] }
      : {
          score: 0,
          status: "fail",
          message: "Eğitim bilgisi eksik.",
          tips: ["Birçok ATS filtresi eğitim seviyesine göre eleme yapar."],
        };
  },
};

const emojiRule: AtsRule = {
  id: "emoji",
  label: "Emoji ve özel semboller",
  maxScore: 5,
  evaluate: ({ resume }) => {
    const found = [...new Set(resumeToPlainText(resume).match(new RegExp(EMOJI_PATTERN.source, "gu")) ?? [])].filter(
      (char) => char.trim() && char !== "‍" && char !== "️",
    );
    if (found.length === 0) {
      return { score: 5, status: "pass", message: "Metinde emoji bulunmadı.", tips: [] };
    }
    return {
      score: 0,
      status: "warn",
      message: `Metinde emoji var: ${found.slice(0, 6).join(" ")}`,
      tips: [
        "Emojiler PDF çıktısından otomatik temizlenir; ancak CV'yi başka bir yere kopyalarsanız bazı ATS'ler bunları bozuk karakter (□) olarak okur. Metinden de kaldırmanız önerilir.",
      ],
    };
  },
};

/** Skoru etkilemez; fotoğraf, doğum tarihi gibi bölgesel tercihlere göre yönlendirir. */
const personalDataRule: AtsRule = {
  id: "personal-data",
  label: "Kişisel veriler ve uluslararası uyum",
  maxScore: 0,
  evaluate: ({ resume, locale }) => {
    const p = resume.personal;
    const hasPhoto = p.showPhoto && Boolean(p.photo);
    const tips: string[] = [];

    if (locale === "en") {
      if (hasPhoto) {
        tips.push(
          "İngilizce CV'lerde (ABD, İngiltere, birçok AB ülkesi) fotoğraf beklenmez; ayrımcılık riskinden dolayı bazı şirketler fotoğraflı CV'leri doğrudan eler. Fotoğrafı gizlemeyi düşünün.",
        );
      }
      if (p.birthDate.trim()) tips.push("Uluslararası başvurularda doğum tarihi paylaşılmaz; kaldırmanız önerilir.");
      if (p.militaryStatus.trim()) tips.push("Askerlik durumu yalnızca Türkiye'deki başvurularda anlamlıdır.");
    } else if (p.birthDate.trim()) {
      tips.push("Doğum tarihi zorunlu değildir ve yaş ayrımcılığına yol açabilir; ilan istemiyorsa kaldırmayı düşünün.");
    }

    return {
      score: 0,
      status: tips.length ? "warn" : "pass",
      message: tips.length
        ? "Opsiyonel kişisel bilgileri hedef ülkeye göre gözden geçirin."
        : hasPhoto
          ? "Fotoğraf kullanılıyor; profesyonel, sade arka planlı bir vesikalık tercih edin."
          : "Kişisel veri kullanımı hedef dile uygun.",
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
