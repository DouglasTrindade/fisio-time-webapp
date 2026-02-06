"use client";

import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";
import { useAppointmentsContext } from "@/contexts/AppointmentsContext";
import { DEFAULT_APPOINTMENT_DURATION_MINUTES } from "../../../constants";
import { apiRequest } from "@/services/api";

interface DndProviderWrapperProps {
  children: React.ReactNode;
}

export function DndProviderWrapper({ children }: DndProviderWrapperProps) {
  const { setLocalAppointments } = useCalendar();
  const { refetch } = useAppointmentsContext();
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    type DropMeta = { type?: string; date?: Date };

    const draggedAppointment = active.data.current?.appointment;
    const dropMeta = over.data.current as DropMeta | undefined;

    if (!draggedAppointment || !dropMeta?.date) return;

    const originalStart = new Date(draggedAppointment.startDate);
    const originalEnd = new Date(draggedAppointment.endDate);
    const durationMs = Math.max(
      originalEnd.getTime() - originalStart.getTime(),
      DEFAULT_APPOINTMENT_DURATION_MINUTES * 60_000,
    );

    const targetDate = new Date(dropMeta.date);
    const dropType = dropMeta.type as "day-cell" | "time-block" | undefined;

    if (dropType === "day-cell") {
      targetDate.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
    }

    if (targetDate.getTime() === originalStart.getTime()) {
      return;
    }

    const newStartISO = targetDate.toISOString();
    const newEndISO = new Date(targetDate.getTime() + durationMs).toISOString();

    setLocalAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === draggedAppointment.id
          ? { ...appointment, startDate: newStartISO, endDate: newEndISO }
          : appointment,
      ),
    );

    try {
      await apiRequest(`/appointments/${draggedAppointment.id}`, {
        method: "PUT",
        data: { date: newStartISO },
      });
      refetch();
      toast.success("Agendamento reagendado com sucesso");
    } catch (error) {
      toast.error("Não foi possível reagendar o agendamento");
      setLocalAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === draggedAppointment.id ? draggedAppointment : appointment,
        ),
      );
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
