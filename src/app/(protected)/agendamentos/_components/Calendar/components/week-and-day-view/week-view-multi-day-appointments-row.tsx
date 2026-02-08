import { useMemo } from "react";
import { parseISO, startOfDay, startOfWeek, endOfWeek, addDays, differenceInDays, isBefore, isAfter } from "date-fns";

import { MonthAppointmentBadge } from "@/app/(protected)/agendamentos/_components/Calendar/components/month-view/month-appointment-badge";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  selectedDate: Date;
  multiDayAppointments: IAppointment[];
}

export function WeekViewMultiDayAppointmentsRow({ selectedDate, multiDayAppointments }: IProps) {
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const processedAppointments = useMemo(() => {
    return multiDayAppointments
      .map(appointment => {
        const start = parseISO(appointment.startDate);
        const end = parseISO(appointment.endDate);
        const adjustedStart = isBefore(start, weekStart) ? weekStart : start;
        const adjustedEnd = isAfter(end, weekEnd) ? weekEnd : end;
        const startIndex = differenceInDays(adjustedStart, weekStart);
        const endIndex = differenceInDays(adjustedEnd, weekStart);

        return {
          ...appointment,
          adjustedStart,
          adjustedEnd,
          startIndex,
          endIndex,
        };
      })
      .sort((a, b) => {
        const startDiff = a.adjustedStart.getTime() - b.adjustedStart.getTime();
        if (startDiff !== 0) return startDiff;
        return b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
      });
  }, [multiDayAppointments, weekStart, weekEnd]);

  const appointmentRows = useMemo(() => {
    const rows: (typeof processedAppointments)[] = [];

    processedAppointments.forEach(appointment => {
      let rowIndex = rows.findIndex(row => row.every(e => e.endIndex < appointment.startIndex || e.startIndex > appointment.endIndex));

      if (rowIndex === -1) {
        rowIndex = rows.length;
        rows.push([]);
      }

      rows[rowIndex].push(appointment);
    });

    return rows;
  }, [processedAppointments]);

  const hasAppointmentsInWeek = useMemo(() => {
    return multiDayAppointments.some(appointment => {
      const start = parseISO(appointment.startDate);
      const end = parseISO(appointment.endDate);

      return (
        // Appointment starts within the week
        (start >= weekStart && start <= weekEnd) ||
        // Appointment ends within the week
        (end >= weekStart && end <= weekEnd) ||
        // Appointment spans the entire week
        (start <= weekStart && end >= weekEnd)
      );
    });
  }, [multiDayAppointments, weekStart, weekEnd]);

  if (!hasAppointmentsInWeek) {
    return null;
  }

  return (
    <div className="hidden overflow-hidden sm:flex">
      <div className="w-18 border-b"></div>
      <div className="grid flex-1 grid-cols-7 divide-x border-b border-l">
        {weekDays.map((day, dayIndex) => (
          <div key={day.toISOString()} className="flex h-full flex-col gap-1 py-1">
            {appointmentRows.map((row, rowIndex) => {
              const appointment = row.find(e => e.startIndex <= dayIndex && e.endIndex >= dayIndex);

              if (!appointment) {
                return <div key={`${rowIndex}-${dayIndex}`} className="h-6.5" />;
              }

              let position: "first" | "middle" | "last" | "none" = "none";

              if (dayIndex === appointment.startIndex && dayIndex === appointment.endIndex) {
                position = "none";
              } else if (dayIndex === appointment.startIndex) {
                position = "first";
              } else if (dayIndex === appointment.endIndex) {
                position = "last";
              } else {
                position = "middle";
              }

              return <MonthAppointmentBadge key={`${appointment.id}-${dayIndex}`} appointment={appointment} cellDate={startOfDay(day)} position={position} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
