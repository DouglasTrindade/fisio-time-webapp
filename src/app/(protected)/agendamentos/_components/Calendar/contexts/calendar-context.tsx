"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

import type { Dispatch, SetStateAction } from "react";
import type { IEvent, IUser } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";
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
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
  createEvent: (date: Date) => void;
  editEvent: (event: IEvent) => void;
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
  events: IEvent[];
  onCreateEvent?: (date: Date) => void;
  onEventEdit?: (event: IEvent) => void;
}

export function CalendarProvider({
  children,
  users,
  events,
  onCreateEvent,
  onEventEdit,
}: CalendarProviderProps) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS);
  const [workingHours, setWorkingHours] = useState<TWorkingHours>(WORKING_HOURS);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">("all");

  // This localEvents doesn't need to exists in a real scenario.
  // It's used here just to simulate the update of the events.
  // In a real scenario, the events would be updated in the backend
  // and the request that fetches the events should be refetched
  const [localEvents, setLocalEvents] = useState<IEvent[]>(events);

  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleCreateEvent = useCallback(
    (date: Date) => {
      if (onCreateEvent) {
        onCreateEvent(date);
      }
    },
    [onCreateEvent],
  );

  const handleEditEvent = useCallback(
    (event: IEvent) => {
      if (onEventEdit) {
        onEventEdit(event);
      }
    },
    [onEventEdit],
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
      events: localEvents,
      setLocalEvents,
      createEvent: handleCreateEvent,
      editEvent: handleEditEvent,
    }),
    [
      selectedDate,
      selectedUserId,
      badgeVariant,
      users,
      visibleHours,
      workingHours,
      localEvents,
      handleCreateEvent,
      handleEditEvent,
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
