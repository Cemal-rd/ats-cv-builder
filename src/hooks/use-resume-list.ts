"use client";

import { useCallback } from "react";
import {
  useFieldArray,
  useFormContext,
  type FieldArray,
  type FieldArrayPath,
  type FieldPath,
} from "react-hook-form";
import { toast } from "sonner";
import type { Resume } from "@/lib/schema/resume";

/**
 * Dinamik liste bölümleri (deneyim, eğitim, özel bölüm kayıtları…) için ortak davranış:
 * ekleme, sıralama (buton + sürükle-bırak) ve "geri al" destekli silme.
 */
export function useResumeList<K extends FieldArrayPath<Resume>>(name: K, createItem: () => FieldArray<Resume, K>) {
  const { control, getValues } = useFormContext<Resume>();
  const { fields, append, insert, remove, move } = useFieldArray<Resume, K, "fieldKey">({
    control,
    name,
    keyName: "fieldKey",
  });

  const add = useCallback(() => append(createItem()), [append, createItem]);

  const removeAt = useCallback(
    (index: number) => {
      const removed = getValues(`${name}.${index}` as FieldPath<Resume>) as unknown as FieldArray<Resume, K>;
      remove(index);
      toast("Öğe silindi", {
        action: { label: "Geri al", onClick: () => insert(index, removed) },
      });
    },
    [getValues, insert, name, remove],
  );

  const moveItem = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= fields.length) return;
      move(from, to);
    },
    [fields.length, move],
  );

  return { fields, ids: fields.map((field) => field.fieldKey), add, removeAt, move: moveItem };
}
