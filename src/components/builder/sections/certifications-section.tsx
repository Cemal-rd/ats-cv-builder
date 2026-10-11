"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { createCertification } from "@/lib/schema/factories";
import type { Resume } from "@/lib/schema/resume";
import { useResumeList } from "@/hooks/use-resume-list";
import { ListItemCard, type ListItemProps } from "../form/list-item-card";
import { ListSection } from "../form/list-section";
import { TextField } from "../form/text-field";

export function CertificationsSection() {
  const list = useResumeList("certifications", createCertification);

  return (
    <ListSection
      list={list}
      emptyText="Henüz sertifika eklenmedi."
      addLabel="Sertifika ekle"
      renderItem={(props) => <CertificationItem {...props} />}
    />
  );
}

function CertificationItem({ index, total, onMove, onRemove }: ListItemProps) {
  const { control } = useFormContext<Resume>();
  const [name, issuer] = useWatch({
    control,
    name: [`certifications.${index}.name`, `certifications.${index}.issuer`],
  });
  const prefix = `certifications.${index}` as const;

  return (
    <ListItemCard
      title={name || "Yeni sertifika"}
      subtitle={issuer}
      index={index}
      total={total}
      onMove={onMove}
      onRemove={onRemove}
    >
      <TextField name={`${prefix}.name`} label="Sertifika adı" placeholder="AWS Certified…" className="sm:col-span-2" />
      <TextField name={`${prefix}.issuer`} label="Veren kurum" placeholder="Amazon Web Services" />
      <TextField name={`${prefix}.date`} label="Tarih" placeholder="2023" />
      <TextField name={`${prefix}.url`} label="Doğrulama bağlantısı" placeholder="credly.com/…" className="sm:col-span-2" />
    </ListItemCard>
  );
}
