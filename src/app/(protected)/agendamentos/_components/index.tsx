"use client";

import { useCallback, useMemo } from "react";
import { addMinutes } from "date-fns";
import { Status } from "@prisma/client";
import { useSession } from "next-auth/react";

import { CalendarProvider } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";
import { ClientContainer } from "@/app/(protected)/agendamentos/_components/Calendar/components/client-container";
import { ChangeBadgeVariantInput } from "@/app/(protected)/agendamentos/_components/Calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/app/(protected)/agendamentos/_components/Calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/app/(protected)/agendamentos/_components/Calendar/components/change-working-hours-input";
import type { IAppointment, IUser } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";
import type { TCalendarView, TAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/types";

import { AppointmentsModal } from "./Modal";
import { useAppointmentsContext } from "@/contexts/AppointmentsContext";
import { useRecords } from "@/hooks/useRecords";
import { toast } from "sonner";
import type { UserProfile } from "@/types/user";
import { DEFAULT_APPOINTMENT_DURATION_MINUTES } from "./constants";

const APPOINTMENT_COLOR_BY_STATUS: Record<Status, TAppointment> = {
  [Status.CONFIRMED]: "green",
  [Status.WAITING]: "yellow",
  [Status.RESCHEDULED]: "purple",
  [Status.CANCELED]: "red",
};

interface CalendarPageClientProps {
  view: TCalendarView;
}

export const CalendarPageClient = ({ view }: CalendarPageClientProps) => {
  const { data: session } = useSession();
  const {
    records: appointmentRecords,
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

  const loggedProfessional = useMemo<IUser | null>(() => {
    if (!session?.user?.id) return null;
    return {
      id: session.user.id,
      name: session.user.name ?? "Meu perfil",
      picturePath: session.user.image ?? null,
    };
  }, [session]);

  const professionalsWithLoggedUser = useMemo(() => {
    if (!loggedProfessional) return professionals;
    const exists = professionals.some((user) => user.id === loggedProfessional.id);
    return exists ? professionals : [...professionals, loggedProfessional];
  }, [professionals, loggedProfessional]);

  const professionalsMap = useMemo(() => {
    return new Map<string, IUser>(
      professionalsWithLoggedUser.map((professional) => [professional.id, professional]),
    );
  }, [professionalsWithLoggedUser]);

  const calendarAppointments: IAppointment[] = useMemo(() => {
    return appointmentRecords.map((appointment) => {
      const startDate = new Date(appointment.date);
      const endDate = addMinutes(startDate, DEFAULT_APPOINTMENT_DURATION_MINUTES);

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
        color: APPOINTMENT_COLOR_BY_STATUS[appointment.status] ?? "blue",
        user,
      };
    });
  }, [appointmentRecords, professionalsMap]);

  const handleCreateAppointment = useCallback(
    (date: Date) => {
      handleDateSelect(date);
      openNew(date);
    },
    [handleDateSelect, openNew],
  );

  const handleAppointmentEdit = useCallback(
    (appointment: IAppointment) => {
      const targetAppointment = appointmentRecords.find(
        (current) => current.id === appointment.id,
      );
      if (!targetAppointment) {
        toast.error("Não foi possível encontrar esse agendamento.");
        return;
      }

      openEdit(targetAppointment);
      handleDateSelect(new Date(targetAppointment.date));
    },
    [appointmentRecords, handleDateSelect, openEdit],
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
      appointments={calendarAppointments}
      users={professionalsWithLoggedUser}
      onCreateAppointment={handleCreateAppointment}
      onAppointmentEdit={handleAppointmentEdit}
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
