"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { Card } from "./Card";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

export function KanbanBoard() {
  const [columns, setColumns] = useState<
    Record<AppointmentStatus, Appointment[]>
  >({
    waiting: [
      { id: "1", name: "João da Silva", phone: "(11) 99999-1234" },
      { id: "2", name: "Maria Oliveira", phone: "(11) 98888-5678" },
    ],
    attended: [],
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const fromColumn = (Object.keys(columns) as AppointmentStatus[]).find(
      (key) => columns[key].some((appt) => appt.id === active.id)
    );

    const toColumn = over.id as AppointmentStatus;

    if (!fromColumn || fromColumn === toColumn) return;

    const item = columns[fromColumn].find((appt) => appt.id === active.id)!;

    setColumns((prev) => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter((appt) => appt.id !== active.id),
      [toColumn]: [...prev[toColumn], item],
    }));
  };

  const activeAppointment =
    Object.values(columns)
      .flat()
      .find((appt) => appt.id === activeId) || null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 gap-3">
        <KanbanColumn
          id="waiting"
          label="Aguardando"
          appointments={columns.waiting}
        />
        <KanbanColumn
          id="attended"
          label="Atendidos"
          appointments={columns.attended}
        />
      </div>
      <DragOverlay>
        {activeAppointment && <Card appointment={activeAppointment} />}
      </DragOverlay>
    </DndContext>
  );
}
