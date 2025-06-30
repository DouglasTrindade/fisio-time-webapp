"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface Appointment {
  id: string | number;
  name: string;
  phone: string;
}

export function KanbanItem({ appointment }: { appointment: Appointment }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: 10,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="bg-white rounded shadow p-3 border cursor-grab"
      style={style}
    >
      <p className="font-medium">{appointment.name}</p>
      <p className="text-sm text-muted-foreground">{appointment.phone}</p>
    </div>
  );
}
