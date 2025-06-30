"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Appointment } from "@/types/appointment";

type Props = {
  appointment: Appointment;
};

export function Card({ appointment }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    zIndex: transform ? 50 : "auto",
    position: transform ? "relative" : "static",
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="p-3 bg-gray-100 rounded shadow text-sm cursor-move transition-all"
    >
      <p className="font-medium">{appointment.name}</p>
      <p className="text-xs text-gray-600">{appointment.phone}</p>
    </div>
  );
}
