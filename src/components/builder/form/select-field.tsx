"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import { Label } from "@/components/ui/label";
import type { Resume } from "@/lib/schema/resume";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  name: FieldPath<Resume>;
  label: string;
  options: readonly { value: string; label: string }[];
  className?: string;
}

/** Native <select>: mobilde işletim sisteminin seçicisini kullanır, ek bağımlılık gerektirmez. */
export function SelectField({ name, label, options, className }: SelectFieldProps) {
  const { register } = useFormContext<Resume>();
  const fieldId = `field-${name.replace(/\./g, "-")}`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <select
        id={fieldId}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        {...register(name)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
