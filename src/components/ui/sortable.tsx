"use client";

import { createContext, useContext } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

interface SortableListProps {
  ids: string[];
  onMove: (from: number, to: number) => void;
  children: React.ReactNode;
}

/** Dikey, klavye ve dokunmatik destekli sıralanabilir liste. */
export function SortableList({ ids, onMove, children }: SortableListProps) {
  const { t } = useI18n();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // Anında kaydırma: "smooth" kaydırma, sekme arka plandayken veya hareket azaltma
    // tercihlerinde takılıp klavyeyle sıralamayı durdurabiliyor.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, scrollBehavior: "auto" }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from !== -1 && to !== -1) onMove(from, to);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      // restrictToParentElement kullanılmaz: açık (uzun) akordeon bölümleri sınıra takılıp hareket edemiyordu.
      modifiers={[restrictToVerticalAxis]}
      accessibility={{ screenReaderInstructions: { draggable: t.list.dragInstructions } }}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

type HandleContextValue = Pick<ReturnType<typeof useSortable>, "attributes" | "listeners" | "setActivatorNodeRef">;

const HandleContext = createContext<HandleContextValue | null>(null);

export function SortableItem({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <HandleContext.Provider value={{ attributes, listeners, setActivatorNodeRef }}>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={cn("relative", isDragging && "z-10 opacity-90 shadow-lg", className)}
      >
        {children}
      </div>
    </HandleContext.Provider>
  );
}

/** SortableItem içindeyse sürükleme tutamacını, değilse hiçbir şey render eder. */
export function DragHandle({ label, className }: { label?: string; className?: string }) {
  const context = useContext(HandleContext);
  const { t } = useI18n();
  if (!context) return null;
  const { attributes, listeners, setActivatorNodeRef } = context;

  return (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label={label ?? t.list.dragItem}
      className={cn(
        "grid h-7 w-6 shrink-0 cursor-grab touch-none place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
        className,
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}
