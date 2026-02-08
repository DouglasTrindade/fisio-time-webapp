"use client";

import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";

interface DroppableTimeBlockProps {
  date: Date;
  hour: number;
  minute: number;
  children: React.ReactNode;
}

export function DroppableTimeBlock({ date, hour, minute, children }: DroppableTimeBlockProps) {
  const slotDate = new Date(date);
  slotDate.setHours(hour, minute, 0, 0);

  const { setNodeRef, isOver } = useDroppable({
    id: `time-block-${slotDate.toISOString()}`,
    data: {
      type: "time-block",
      date: slotDate,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("h-[24px] w-full", isOver && "bg-primary/10")}
    >
      {children}
    </div>
  );
}
