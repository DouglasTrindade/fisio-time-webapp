"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";
import { useAppointmentsContext } from "@/contexts/AppointmentsContext";
import { DEFAULT_APPOINTMENT_DURATION_MINUTES } from "../../../constants";

interface DndProviderWrapperProps {
  children: React.ReactNode;
}

export function DndProviderWrapper({ children }: DndProviderWrapperProps) {
  const { setLocalAppointments } = useCalendar();
  const { handleUpdate, refetch } = useAppointmentsContext();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const draggedAppointment = active.data.current?.appointment;
    const dropTargetDate = over.data.current?.date;

    if (!draggedAppointment || !dropTargetDate) return;

    const newStartISO = dropTargetDate.toISOString();
    const newEndISO = new Date(
      dropTargetDate.getTime() + DEFAULT_APPOINTMENT_DURATION_MINUTES * 60_000,
    ).toISOString();

    setLocalAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === draggedAppointment.id
          ? { ...appointment, startDate: newStartISO, endDate: newEndISO }
          : appointment,
      ),
    );

    try {
      await handleUpdate(draggedAppointment.id, { date: newStartISO });
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

  return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}
