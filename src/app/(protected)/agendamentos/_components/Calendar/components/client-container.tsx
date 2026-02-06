"use client";

import { useMemo } from "react";
import { isSameDay, parseISO } from "date-fns";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { DndProviderWrapper } from "@/app/(protected)/agendamentos/_components/Calendar/components/dnd/dnd-provider";

import { CalendarHeader } from "@/app/(protected)/agendamentos/_components/Calendar/components/header/calendar-header";
import { CalendarYearView } from "@/app/(protected)/agendamentos/_components/Calendar/components/year-view/calendar-year-view";
import { CalendarMonthView } from "@/app/(protected)/agendamentos/_components/Calendar/components/month-view/calendar-month-view";
import { CalendarAgendaView } from "@/app/(protected)/agendamentos/_components/Calendar/components/agenda-view/calendar-agenda-view";
import { CalendarDayView } from "@/app/(protected)/agendamentos/_components/Calendar/components/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@/app/(protected)/agendamentos/_components/Calendar/components/week-and-day-view/calendar-week-view";

import type { TCalendarView } from "@/app/(protected)/agendamentos/_components/Calendar/types";

interface IProps {
  view: TCalendarView;
}

export function ClientContainer({ view }: IProps) {
  const { selectedDate, selectedUserId, appointments } = useCalendar();

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const appointmentStartDate = parseISO(appointment.startDate);
      const appointmentEndDate = parseISO(appointment.endDate);

      if (view === "year") {
        const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
        const yearEnd = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        const isInSelectedYear = appointmentStartDate <= yearEnd && appointmentEndDate >= yearStart;
        const isUserMatch = selectedUserId === "all" || appointment.user.id === selectedUserId;
        return isInSelectedYear && isUserMatch;
      }

      if (view === "month" || view === "agenda") {
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const isInSelectedMonth = appointmentStartDate <= monthEnd && appointmentEndDate >= monthStart;
        const isUserMatch = selectedUserId === "all" || appointment.user.id === selectedUserId;
        return isInSelectedMonth && isUserMatch;
      }

      if (view === "week") {
        const dayOfWeek = selectedDate.getDay();

        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const isInSelectedWeek = appointmentStartDate <= weekEnd && appointmentEndDate >= weekStart;
        const isUserMatch = selectedUserId === "all" || appointment.user.id === selectedUserId;
        return isInSelectedWeek && isUserMatch;
      }

      if (view === "day") {
        const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
        const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
        const isInSelectedDay = appointmentStartDate <= dayEnd && appointmentEndDate >= dayStart;
        const isUserMatch = selectedUserId === "all" || appointment.user.id === selectedUserId;
        return isInSelectedDay && isUserMatch;
      }
    });
  }, [selectedDate, selectedUserId, appointments, view]);

  const singleDayAppointments = filteredAppointments.filter(appointment => {
    const startDate = parseISO(appointment.startDate);
    const endDate = parseISO(appointment.endDate);
    return isSameDay(startDate, endDate);
  });

  const multiDayAppointments = filteredAppointments.filter(appointment => {
    const startDate = parseISO(appointment.startDate);
    const endDate = parseISO(appointment.endDate);
    return !isSameDay(startDate, endDate);
  });

  // For year view, we only care about the start date
  // by using the same date for both start and end,
  // we ensure only the start day will show a dot
  const appointmentStartDates = useMemo(() => {
    return filteredAppointments.map(appointment => ({ ...appointment, endDate: appointment.startDate }));
  }, [filteredAppointments]);

  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeader view={view} appointments={filteredAppointments} />

      <DndProviderWrapper>
        {view === "day" && <CalendarDayView singleDayAppointments={singleDayAppointments} multiDayAppointments={multiDayAppointments} />}
        {view === "month" && <CalendarMonthView singleDayAppointments={singleDayAppointments} multiDayAppointments={multiDayAppointments} />}
        {view === "week" && <CalendarWeekView singleDayAppointments={singleDayAppointments} multiDayAppointments={multiDayAppointments} />}
        {view === "year" && <CalendarYearView allAppointments={appointmentStartDates} />}
        {view === "agenda" && <CalendarAgendaView singleDayAppointments={singleDayAppointments} multiDayAppointments={multiDayAppointments} />}
      </DndProviderWrapper>
    </div>
  );
}
