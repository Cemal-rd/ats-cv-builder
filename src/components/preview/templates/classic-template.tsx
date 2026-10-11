import { resumeLabels } from "@/lib/resume/labels";
import {
  displayUrl,
  formatDateRange,
  getContactItems,
  getPersonalDetails,
  getPhoto,
  joinNonEmpty,
  selectFilledSections,
  splitList,
  toBullets,
} from "@/lib/resume/format";
import { OrderedSections, ResumePhoto, type SectionRenderers } from "./shared";
import type { TemplateProps } from "./types";

/**
 * Classic Corporate — serif, ortalanmış başlık, çizgili bölüm başlıkları.
 * Tek sütun, tablo/ikon yok: ATS'ler metni yukarıdan aşağı sırayla okur.
 */
const DEFAULT_FONT = 'Georgia, "Times New Roman", Times, serif';

export function ClassicTemplate({ resume, locale, fontFamily = DEFAULT_FONT }: TemplateProps) {
  const t = resumeLabels[locale];
  const { personal } = resume;
  const data = selectFilledSections(resume);
  const contacts = getContactItems(personal);
  const details = getPersonalDetails(personal, t);
  const photo = getPhoto(personal);

  const renderers: SectionRenderers = {
    builtin: {
      experience: () =>
        data.experience.length > 0 && (
          <Section title={t.experience}>
            {data.experience.map((item) => (
              <Entry
                key={item.id}
                title={item.position}
                meta={formatDateRange(item.startDate, item.endDate, item.current, t.present)}
                subtitle={item.company}
                subMeta={item.location}
                bullets={toBullets(item.description)}
              />
            ))}
          </Section>
        ),
      education: () =>
        data.education.length > 0 && (
          <Section title={t.education}>
            {data.education.map((item) => (
              <Entry
                key={item.id}
                title={joinNonEmpty([item.degree, item.field], ", ")}
                meta={formatDateRange(item.startDate, item.endDate, false, t.present)}
                subtitle={joinNonEmpty([item.institution, item.gpa && `${t.gpa}: ${item.gpa}`], " — ")}
                subMeta={item.location}
                bullets={toBullets(item.description)}
              />
            ))}
          </Section>
        ),
      skills: () =>
        data.skills.length > 0 && (
          <Section title={t.skills}>
            <ul className="space-y-0.5">
              {data.skills.map((group) => (
                <li key={group.id}>
                  {group.category && <strong>{group.category}: </strong>}
                  {splitList(group.items).join(", ")}
                </li>
              ))}
            </ul>
          </Section>
        ),
      languages: () =>
        data.languages.length > 0 && (
          <Section title={t.languages}>
            <p>
              {data.languages.map((l) => `${l.name.trim()} (${t.languageLevels[l.level]})`).join("  |  ")}
            </p>
          </Section>
        ),
      projects: () =>
        data.projects.length > 0 && (
          <Section title={t.projects}>
            {data.projects.map((item) => (
              <Entry
                key={item.id}
                title={item.name}
                meta={formatDateRange(item.startDate, item.endDate, false, t.present)}
                subtitle={joinNonEmpty([item.role, displayUrl(item.url)], " — ")}
                bullets={toBullets(item.description)}
              />
            ))}
          </Section>
        ),
      certifications: () =>
        data.certifications.length > 0 && (
          <Section title={t.certifications}>
            <ul className="list-disc space-y-0.5 pl-5">
              {data.certifications.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong>
                  {item.issuer && ` — ${item.issuer}`}
                  {item.date && ` (${item.date})`}
                </li>
              ))}
            </ul>
          </Section>
        ),
    },
    custom: (section) => (
      <Section title={section.title}>
        {section.entries.map((entry) => (
          <Entry
            key={entry.id}
            title={entry.title}
            meta={entry.date}
            subtitle={entry.subtitle}
            bullets={toBullets(entry.description)}
          />
        ))}
      </Section>
    ),
  };

  return (
    <article
      className="resume-page"
      style={{ fontFamily, fontSize: "10.5pt", lineHeight: 1.4 }}
    >
      <header className="flex items-center gap-5">
        {photo && <ResumePhoto src={photo} size="26mm" className="shrink-0 rounded-sm" />}
        <div className={photo ? "flex-1" : "flex-1 text-center"}>
          <h1 className="text-[20pt] font-bold leading-tight tracking-wide">{personal.fullName || t.namePlaceholder}</h1>
          {personal.title && <p className="mt-0.5 text-[11.5pt]">{personal.title}</p>}
          {contacts.length > 0 && <p className="mt-1.5 text-[9.5pt]">{contacts.join("  |  ")}</p>}
          {details.length > 0 && <p className="mt-0.5 text-[9.5pt]">{details.join("  |  ")}</p>}
        </div>
      </header>

      {data.summary && (
        <Section title={t.summary}>
          <p>{data.summary}</p>
        </Section>
      )}

      <OrderedSections resume={resume} data={data} renderers={renderers} />
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="border-b border-neutral-800 pb-0.5 text-[11pt] font-bold uppercase tracking-wider">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

interface EntryProps {
  title: string;
  meta?: string;
  subtitle?: string;
  subMeta?: string;
  bullets: string[];
}

function Entry({ title, meta, subtitle, subMeta, bullets }: EntryProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-bold">{title}</h3>
        {meta && <span className="shrink-0 text-[9.5pt]">{meta}</span>}
      </div>
      {(subtitle || subMeta) && (
        <div className="flex items-baseline justify-between gap-4 italic">
          <span>{subtitle}</span>
          {subMeta && <span className="shrink-0 text-[9.5pt]">{subMeta}</span>}
        </div>
      )}
      {bullets.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
