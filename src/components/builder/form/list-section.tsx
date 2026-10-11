"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableItem, SortableList } from "@/components/ui/sortable";
import type { ListItemProps } from "./list-item-card";

interface ListSectionProps {
  /** useResumeList() dönüşü. */
  list: {
    ids: string[];
    add: () => void;
    removeAt: (index: number) => void;
    move: (from: number, to: number) => void;
  };
  emptyText: string;
  addLabel: string;
  renderItem: (props: ListItemProps) => React.ReactNode;
}

/** Dinamik liste bölümlerinin ortak iskeleti: sürükle-bırak sıralama + boş durum + ekle butonu. */
export function ListSection({ list, emptyText, addLabel, renderItem }: ListSectionProps) {
  const { ids, add, removeAt, move } = list;

  return (
    <div className="space-y-3">
      {ids.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <SortableList ids={ids} onMove={move}>
          <div className="space-y-3">
            {ids.map((id, index) => (
              <SortableItem key={id} id={id}>
                {renderItem({ index, total: ids.length, onMove: move, onRemove: () => removeAt(index) })}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}
      <Button variant="outline" size="sm" className="w-full border-dashed" onClick={add}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}
