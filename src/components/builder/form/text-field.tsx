"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Resume } from "@/lib/schema/resume";
import { cn } from "@/lib/utils";

interface TextFieldProps {
  name: FieldPath<Resume>;
  label: string;
  placeholder?: string;
  hint?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  /** <datalist> önerileri; kullanıcı yine serbest metin girebilir. */
  suggestions?: readonly string[];
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export function TextField({
  name,
  label,
  hint,
  multiline = false,
  rows = 4,
  type,
  suggestions,
  className,
  ...inputProps
}: TextFieldProps) {
  const { register, getFieldState, formState } = useFormContext<Resume>();
  const { error } = getFieldState(name, formState);

  const fieldId = `field-${name.replace(/\./g, "-")}`;
  const messageId = `${fieldId}-message`;
  const listId = suggestions ? `${fieldId}-options` : undefined;
  const message = error?.message ?? hint;
  const controlProps = {
    id: fieldId,
    "aria-invalid": Boolean(error),
    "aria-describedby": message ? messageId : undefined,
    ...inputProps,
    ...register(name),
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      {multiline ? (
        <Textarea rows={rows} {...controlProps} />
      ) : (
        <Input type={type} list={listId} {...controlProps} />
      )}
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}
      {message && (
        <p id={messageId} className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
          {message}
        </p>
      )}
    </div>
  );
}
