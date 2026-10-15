"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useI18n } from "@/i18n/provider";
import { createCertification } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

export function CertificationsSection() {
  const { t } = useI18n();
  const list = useResumeList("certifications", createCertification);

  return (
    <ListSection
      list={list}
      emptyText={t.certifications.empty}
      addLabel={t.certifications.add}
      renderItem={(props) => <CertificationItem {...props} />}
    />
  );
}

function CertificationItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { t } = useI18n();
  const { control } = useFormContext<Resume>();
  const [name, issuer] = useWatch({
    control,
    name: [`certifications.${index}.name`, `certifications.${index}.issuer`],
  });
  const prefix = `certifications.${index}` as const;

  return (
    <ListItemCard
      title={name || t.certifications.newItem}
      subtitle={issuer}
      index={index}
      total={total}
      onMove={onMove}
      onRemove={onRemove}
    >
      <TextField name={`${prefix}.name`} label={t.certifications.name} placeholder="AWS Certified…" className="sm:col-span-2" />
      <TextField name={`${prefix}.issuer`} label={t.certifications.issuer} placeholder="Amazon Web Services" />
      <TextField name={`${prefix}.date`} label={t.fields.date} placeholder="2023" />
      <TextField name={`${prefix}.url`} label={t.certifications.url} placeholder="credly.com/…" className="sm:col-span-2" />
    </ListItemCard>
  );
}
