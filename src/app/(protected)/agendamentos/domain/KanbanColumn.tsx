"use client";

import { useDroppable } from "@dnd-kit/core";
import type { AppointmentStatus, Appointment } from "@/types/appointment";
import { Card } from "./Card";

type Props = {
  id: AppointmentStatus;
  label: string;
  appointments: Appointment[];
};

export function KanbanColumn({ id, label, appointments }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`w-full p-4 rounded-lg border shadow-md transition ${
        isOver ? "bg-green-100" : "bg-black"
      }`}
    >
      <h2 className="font-bold text-lg mb-4">{label}</h2>
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <Card key={appointment.id} appointment={appointment} />
        ))}
      </div>
    </div>
  );
}
