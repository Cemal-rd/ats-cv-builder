"use client";

import { useState } from "react";
import { Plus, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useResumeStore } from "@/store/resume-store";
import { CUSTOM_SECTION_PRESETS, type CustomSectionPreset } from "./presets";
import { SECTION_ICONS } from "./section-icons";

interface AddSectionMenuProps {
  onAdd: (preset: CustomSectionPreset | null) => void;
}

export function AddSectionMenu({ onAdd }: AddSectionMenuProps) {
  const [open, setOpen] = useState(false);
  const locale = useResumeStore((s) => s.locale);

  const select = (preset: CustomSectionPreset | null) => {
    setOpen(false);
    onAdd(preset);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4 w-full border-dashed">
          <Plus />
          Özel bölüm ekle
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-[min(22rem,calc(100vw-2rem))] p-2">
        <p className="px-2 pb-2 pt-1 text-xs font-medium text-muted-foreground">Hazır bölümler</p>
        <div className="grid gap-1 sm:grid-cols-2">
          {CUSTOM_SECTION_PRESETS.map((preset) => {
            const Icon = SECTION_ICONS[preset.icon].icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => select(preset)}
                className="flex items-start gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  <span className="block text-sm font-medium leading-tight">{preset.title[locale]}</span>
                  <span className="block text-xs text-muted-foreground">{preset.description}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-1 border-t pt-1">
          <button
            type="button"
            onClick={() => select(null)}
            className="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
          >
            <SquarePlus className="h-4 w-4 text-muted-foreground" />
            Boş bölüm (kendi başlığınla)
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
