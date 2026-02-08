"use client";

import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";

import type { ICalendarCell } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface DroppableDayCellProps {
  cell: ICalendarCell;
  children: React.ReactNode;
}

export function DroppableDayCell({ cell, children }: DroppableDayCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-cell-${cell.date.toISOString()}`,
    data: {
      type: "day-cell",
      date: cell.date,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("min-h-24", isOver && "ring-2 ring-primary/60 rounded-md")}
    >
      {children}
    </div>
  );
}
