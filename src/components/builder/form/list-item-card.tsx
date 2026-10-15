"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragHandle } from "@/components/ui/sortable";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** Liste öğesi bileşenlerinin (ExperienceItem, ProjectItem…) ortak props'u. */
export interface ListItemProps {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}

interface ListItemCardProps extends ListItemProps {
  title: string;
  subtitle?: string;
  /** Tek satırlık kısa kayıtlar (ör. dil) için başlık çubuğu olmadan sıkışık görünüm. */
  compact?: boolean;
  children: React.ReactNode;
}

export function ListItemCard({ title, subtitle, index, total, onMove, onRemove, compact, children }: ListItemCardProps) {
  const { t } = useI18n();
  const controls = (
    <div className="flex shrink-0 items-center">
      {/* Butonlar sürükle-bırakın klavye/mobil alternatifi olarak kalır. */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label={t.list.moveUp}
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
      >
        <ArrowUp />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label={t.list.moveDown}
        disabled={index === total - 1}
        onClick={() => onMove(index, index + 1)}
      >
        <ArrowDown />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        aria-label={t.list.remove}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  );

  if (compact) {
    return (
      <div className="flex items-end gap-1 rounded-lg border bg-card p-2">
        <DragHandle className="mb-1" />
        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">{children}</div>
        <div className="mb-0.5">{controls}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-1 border-b px-2 py-2">
        <DragHandle />
        <div className={cn("min-w-0 flex-1 pl-1")}>
          <p className="truncate text-sm font-medium">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {controls}
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}
