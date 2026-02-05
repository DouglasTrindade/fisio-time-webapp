"use client";

import { useCallback, useMemo } from "react";
import { addMinutes } from "date-fns";
import { Status } from "@prisma/client";

import { CalendarProvider } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";
import { ClientContainer } from "@/app/(protected)/agendamentos/_components/Calendar/components/client-container";
import { ChangeBadgeVariantInput } from "@/app/(protected)/agendamentos/_components/Calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/app/(protected)/agendamentos/_components/Calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/app/(protected)/agendamentos/_components/Calendar/components/change-working-hours-input";
import type { IEvent, IUser } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";
import type { TCalendarView, TEventColor } from "@/app/(protected)/agendamentos/_components/Calendar/types";

import { AppointmentsModal } from "./Modal";
import { useAppointmentsContext } from "@/contexts/AppointmentsContext";
import { useRecords } from "@/hooks/useRecords";
import type { UserProfile } from "@/types/user";

const EVENT_COLOR_BY_STATUS: Record<Status, TEventColor> = {
  CONFIRMED: "green",
  WAITING: "yellow",
  RESCHEDULED: "purple",
  CANCELED: "red",
};

const DEFAULT_EVENT_DURATION_MINUTES = 60;

interface CalendarPageClientProps {
  view: TCalendarView;
}

export const CalendarPageClient = ({ view }: CalendarPageClientProps) => {
  const {
    records: appointments,
    isDialogOpen,
    editingAppointment,
    selectedDate,
    handleDateSelect,
    openNew,
    openEdit,
    closeDialog,
  } = useAppointmentsContext();

  const { records: usersResponse } = useRecords<UserProfile>("/users", {
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  const professionals: IUser[] = useMemo(
    () =>
      usersResponse
        .filter((user) => user.role === "PROFESSIONAL")
        .map((user) => ({
          id: user.id,
          name: user.name ?? "Profissional",
          picturePath: user.image ?? null,
        })),
    [usersResponse],
  );

  const professionalsMap = useMemo(() => {
    return new Map<string, IUser>(
      professionals.map((professional) => [professional.id, professional]),
    );
  }, [professionals]);

  const events: IEvent[] = useMemo(() => {
    return appointments.map((appointment) => {
      const startDate = new Date(appointment.date);
      const endDate = addMinutes(startDate, DEFAULT_EVENT_DURATION_MINUTES);

      const user =
        professionalsMap.get(appointment.professionalId) ?? {
          id: appointment.professionalId,
          name: "Profissional",
          picturePath: null,
        };

      return {
        id: appointment.id,
        title: appointment.name || "Paciente sem nome",
        description: appointment.notes ?? "",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        color: EVENT_COLOR_BY_STATUS[appointment.status] ?? "blue",
        user,
      };
    });
  }, [appointments, professionalsMap]);

  const handleCreateEvent = useCallback(
    (date: Date) => {
      handleDateSelect(date);
      openNew(date);
    },
    [handleDateSelect, openNew],
  );

  const handleEventEdit = useCallback(
    (event: IEvent) => {
      const appointment = appointments.find(
        (current) => current.id === event.id,
      );
      if (appointment) {
        handleDateSelect(new Date(appointment.date));
        openEdit(appointment);
      }
    },
    [appointments, handleDateSelect, openEdit],
  );

  const modalInitialDate = useMemo(() => {
    if (editingAppointment) {
      return editingAppointment.date;
    }

    if (selectedDate) {
      const templateDate = new Date(selectedDate);
      templateDate.setHours(9, 0, 0, 0);
      return templateDate.toISOString();
    }

    return undefined;
  }, [editingAppointment, selectedDate]);

  return (
    <CalendarProvider
      events={events}
      users={professionals}
      onCreateEvent={handleCreateEvent}
      onEventEdit={handleEventEdit}
    >
      <ClientContainer view={view} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChangeBadgeVariantInput />
        <ChangeVisibleHoursInput />
        <ChangeWorkingHoursInput />
      </div>
      <AppointmentsModal
        open={isDialogOpen}
        onClose={closeDialog}
        initialDate={modalInitialDate}
        appointment={editingAppointment}
      />
    </CalendarProvider>
  );
};
