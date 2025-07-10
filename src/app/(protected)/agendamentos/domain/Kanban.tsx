"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanBanCard } from "./Card";
import { useAppointmentContext } from "@/contexts/AppointmentContext";
import { useAppointments, useUpdateAppointmentStatus } from "@/app/utils/hooks/useAppointments";
import type { Appointment, AppointmentStatus } from "@/app/utils/types/appointment";

export const KanbanBoard = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { selectedDate, getAppointmentsByDate } = useAppointmentContext();
  const { mutate: updateAppointmentStatus } = useUpdateAppointmentStatus();

  const { data: appointments, isLoading } = useAppointments(selectedDate || undefined);

  const columns = useMemo(() => {
    if (!appointments) return { waiting: [], attended: [] };

    const waiting = appointments.filter(apt => apt.status === 'waiting');
    const attended = appointments.filter(apt => apt.status === 'attended');

    return { waiting, attended };
  }, [appointments]);

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

    updateAppointmentStatus({
      id: active.id as string,
      status: toColumn
    });
  };

  const activeAppointment = useMemo(() => {
    if (!activeId || !appointments) return null;
    return appointments.find((appt) => appt.id === activeId) || null;
  }, [activeId, appointments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Selecione uma data";
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full">
      <div className="flex flex-col mb-4 p-4 border rounded-lg">
        <span className="text-lg font-semibold">
          Agendamentos para {formatDate(selectedDate)}
        </span>
        <span className="text-sm text-gray-600">
          {columns.waiting.length} pacientes aguardando • {columns.attended.length} pacientes atendidos
        </span>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-3">
          <KanbanColumn
            id="waiting"
            label="Pacientes para Atender"
            appointments={columns.waiting}
            count={columns.waiting.length}
          />
          <KanbanColumn
            id="attended"
            label="Pacientes Atendidos"
            appointments={columns.attended}
            count={columns.attended.length}
          />
        </div>
        <DragOverlay>
          {activeAppointment && <KanBanCard appointment={activeAppointment} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};