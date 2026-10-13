import { resumeLabels } from "@/lib/resume/labels";
import {
  formatDateRange,
  getContactItems,
  getPersonalDetails,
  getPhoto,
  joinNonEmpty,
  selectFilledSections,
  splitList,
  toBullets,
  toHref,
} from "@/lib/resume/format";
import { ContactLine, OrderedSections, ResumeHeader, ResumeLink, UrlLink, type SectionRenderers } from "./shared";
import type { TemplateProps } from "./types";

/**
 * Modern Clean — sans-serif, sola hizalı, sade vurgu rengi.
 * Görsel hiyerarşi yalnızca tipografi ile kurulur; ATS uyumluluğu korunur.
 */
const DEFAULT_FONT = "Arial, Helvetica, sans-serif";

export function ModernTemplate({ resume, locale, header, fontFamily = DEFAULT_FONT }: TemplateProps) {
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
                title={joinNonEmpty([item.position, item.company], " — ")}
                meta={formatDateRange(item.startDate, item.endDate, item.current, t.present)}
                subtitle={item.location}
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
                subtitle={joinNonEmpty([item.institution, item.location, item.gpa && `${t.gpa}: ${item.gpa}`], " · ")}
                bullets={toBullets(item.description)}
              />
            ))}
          </Section>
        ),
      skills: () =>
        data.skills.length > 0 && (
          <Section title={t.skills}>
            <div className="space-y-0.5">
              {data.skills.map((group) => (
                <p key={group.id}>
                  {group.category && <span className="font-semibold">{group.category}: </span>}
                  {splitList(group.items).join(", ")}
                </p>
              ))}
            </div>
          </Section>
        ),
      languages: () =>
        data.languages.length > 0 && (
          <Section title={t.languages}>
            <p>
              {data.languages.map((l, i) => (
                <span key={l.id}>
                  {i > 0 && " · "}
                  <span className="font-semibold">{l.name.trim()}</span> ({t.languageLevels[l.level]})
                </span>
              ))}
            </p>
          </Section>
        ),
      projects: () =>
        data.projects.length > 0 && (
          <Section title={t.projects}>
            {data.projects.map((item) => (
              <Entry
                key={item.id}
                title={joinNonEmpty([item.name, item.role], " — ")}
                meta={formatDateRange(item.startDate, item.endDate, false, t.present)}
                subtitle={item.url ? <UrlLink url={item.url} /> : undefined}
                bullets={toBullets(item.description)}
              />
            ))}
          </Section>
        ),
      certifications: () =>
        data.certifications.length > 0 && (
          <Section title={t.certifications}>
            <ul className="list-disc space-y-0.5 pl-5">
              {data.certifications.map((item) => {
                const meta = joinNonEmpty([item.issuer, item.date], ", ");
                return (
                  <li key={item.id}>
                    {item.url ? (
                      <ResumeLink href={toHref(item.url)}>
                        <span className="font-semibold">{item.name}</span>
                      </ResumeLink>
                    ) : (
                      <span className="font-semibold">{item.name}</span>
                    )}
                    {meta && ` — ${meta}`}
                  </li>
                );
              })}
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
    // CV dili: büyük harfe çevirme dile göre yapılır (en: "education" → "EDUCATION", tr: "eğitim" → "EĞİTİM").
    <article lang={locale} className="resume-page" style={{ fontFamily, fontSize: "10pt", lineHeight: 1.45 }}>
      <ResumeHeader layout={header} photo={photo} photoSize="27mm" photoClassName="rounded-md">
        <h1 className="text-[22pt] font-bold leading-tight tracking-tight text-neutral-900">
          {personal.fullName || t.namePlaceholder}
        </h1>
        {personal.title && <p className="mt-0.5 text-[12pt] font-medium text-slate-600">{personal.title}</p>}
        {contacts.length > 0 && <ContactLine items={contacts} separator=" · " className="mt-2 text-[9pt] text-neutral-700" />}
        {details.length > 0 && <p className="mt-0.5 text-[9pt] text-neutral-700">{details.join(" · ")}</p>}
      </ResumeHeader>

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
    <section className="mt-5">
      <h2 className="text-[10pt] font-bold uppercase tracking-[0.12em] text-slate-700">{title}</h2>
      <div className="mt-1.5 space-y-3 border-t border-slate-300 pt-2">{children}</div>
    </section>
  );
}

interface EntryProps {
  title: string;
  meta?: string;
  subtitle?: React.ReactNode;
  bullets: string[];
}

function Entry({ title, meta, subtitle, bullets }: EntryProps) {
  return (
    <div>
      {(title || meta) && (
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          {meta && <span className="shrink-0 text-[9pt] text-slate-600">{meta}</span>}
        </div>
      )}
      {subtitle && <p className="text-[9pt] text-slate-600">{subtitle}</p>}
      {bullets.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 marker:text-slate-500">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
