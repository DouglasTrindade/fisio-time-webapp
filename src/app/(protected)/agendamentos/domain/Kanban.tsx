"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanBanCard } from "./Card";
import type { Appointment, AppointmentStatus } from "@/app/utils/types/appointment";

export const KanbanBoard = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columns, setColumns] = useState<
    Record<AppointmentStatus, Appointment[]>
  >({
    waiting: [],
    attended: [],
  });

  useEffect(() => {
    setColumns({
      waiting: [
        { id: "1", name: "João da Silva", phone: "(11) 99999-1234", time: '15:00' },
        { id: "2", name: "Maria Oliveira", phone: "(11) 98888-5678", time: '12:00' },
        { id: "4", name: "Antonio Neto", phone: "(11) 93333-3342", time: '09:00' },
      ],
      attended: [
        { id: "3", name: "Felipe Costa", phone: "(11) 92233-1234", time: '08:00' },
        { id: "4", name: "Gustavo Alves", phone: "(11) 96662-3342", time: '11:00' },
      ],
    });
  }, []);


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
      <div className="grid grid-cols-2 gap-3 h-full">
        <KanbanColumn
          id="waiting"
          label="Pacientes Hoje"
          appointments={columns.waiting}
        />
        <KanbanColumn
          id="attended"
          label="Pacientes Atendidos"
          appointments={columns.attended}
        />
      </div>
      <DragOverlay>
        {activeAppointment && <KanBanCard appointment={activeAppointment} />}
      </DragOverlay>
    </DndContext>
  );
}
