"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

import type { Dispatch, SetStateAction } from "react";
import type { IAppointment, IUser } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";
import type { TBadgeVariant, TVisibleHours, TWorkingHours } from "@/app/(protected)/agendamentos/_components/Calendar/types";

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  users: IUser[];
  workingHours: TWorkingHours;
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  appointments: IAppointment[];
  setLocalAppointments: Dispatch<SetStateAction<IAppointment[]>>;
  createAppointment: (date: Date) => void;
  editAppointment: (appointment: IAppointment) => void;
}

const CalendarContext = createContext({} as ICalendarContext);

const WORKING_HOURS = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 8, to: 12 },
};

const VISIBLE_HOURS = { from: 7, to: 18 };

interface CalendarProviderProps {
  children: React.ReactNode;
  users: IUser[];
  appointments: IAppointment[];
  onCreateAppointment?: (date: Date) => void;
  onAppointmentEdit?: (appointment: IAppointment) => void;
}

export function CalendarProvider({
  children,
  users,
  appointments,
  onCreateAppointment,
  onAppointmentEdit,
}: CalendarProviderProps) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS);
  const [workingHours, setWorkingHours] = useState<TWorkingHours>(WORKING_HOURS);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">("all");

  // This localAppointments doesn't need to exists in a real scenario.
  // It's used here just to simulate the update of the appointments.
  // In a real scenario, the appointments would be updated in the backend
  // and the request that fetches the appointments should be refetched
  const [localAppointments, setLocalAppointments] = useState<IAppointment[]>(appointments);

  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleCreateAppointment = useCallback(
    (date: Date) => {
      if (onCreateAppointment) {
        onCreateAppointment(date);
      }
    },
    [onCreateAppointment],
  );

  const handleEditAppointment = useCallback(
    (appointment: IAppointment) => {
      if (onAppointmentEdit) {
        onAppointmentEdit(appointment);
      }
    },
    [onAppointmentEdit],
  );

  const contextValue = useMemo(
    () => ({
      selectedDate,
      setSelectedDate: handleSelectDate,
      selectedUserId,
      setSelectedUserId,
      badgeVariant,
      setBadgeVariant,
      users,
      visibleHours,
      setVisibleHours,
      workingHours,
      setWorkingHours,
      appointments: localAppointments,
      setLocalAppointments,
      createAppointment: handleCreateAppointment,
      editAppointment: handleEditAppointment,
    }),
    [
      selectedDate,
      selectedUserId,
      badgeVariant,
      users,
      visibleHours,
      workingHours,
      localAppointments,
      handleCreateAppointment,
      handleEditAppointment,
    ],
  );

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
