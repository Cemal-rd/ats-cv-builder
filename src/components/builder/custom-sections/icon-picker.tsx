"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { getSectionIcon, SECTION_ICONS, type SectionIconKey } from "./section-icons";

interface IconPickerProps {
  value: string;
  onChange: (icon: SectionIconKey) => void;
}

/** Özel bölüm simgesi — yalnızca editörde bölümleri ayırt etmek için; CV'ye yazılmaz. */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const Current = getSectionIcon(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t.icons.change}
          title={t.icons.changeTitle}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted ring-offset-background transition hover:ring-2 hover:ring-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Current className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        <p className="px-1 pb-2 text-xs text-muted-foreground">{t.icons.onlyInEditor}</p>
        <div className="grid grid-cols-6 gap-1" role="radiogroup" aria-label={t.icons.groupAria}>
          {(Object.keys(SECTION_ICONS) as SectionIconKey[]).map((key) => {
            const Icon = SECTION_ICONS[key].icon;
            const label = t.icons.labels[key];
            const selected = key === value || (!value && key === "list");
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={label}
                title={label}
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
