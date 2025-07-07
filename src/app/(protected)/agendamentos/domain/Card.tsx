"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Appointment } from "@/app/utils/types/appointment";

type Props = {
  appointment: Appointment;
};

export function Card({ appointment }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: 999,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="p-3 bg-gray-800 rounded shadow text-sm cursor-move transition-all"
    >
      <p className="font-medium ">{appointment.name}</p>
      <p className="text-xs text-gray-600">{appointment.phone}</p>
    </div>
  );
}
