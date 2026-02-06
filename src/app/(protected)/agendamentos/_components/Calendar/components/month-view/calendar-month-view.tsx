import { useMemo } from "react";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { DayCell } from "@/app/(protected)/agendamentos/_components/Calendar/components/month-view/day-cell";

import { getCalendarCells, calculateMonthAppointmentPositions } from "@/app/(protected)/agendamentos/_components/Calendar/helpers";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  singleDayAppointments: IAppointment[];
  multiDayAppointments: IAppointment[];
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({ singleDayAppointments, multiDayAppointments }: IProps) {
  const { selectedDate } = useCalendar();

  const allAppointments = [...multiDayAppointments, ...singleDayAppointments];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const appointmentPositions = useMemo(
    () => calculateMonthAppointmentPositions(multiDayAppointments, singleDayAppointments, selectedDate),
    [multiDayAppointments, singleDayAppointments, selectedDate]
  );

  return (
    <div>
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map(day => (
          <div key={day} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map(cell => (
          <DayCell key={cell.date.toISOString()} cell={cell} appointments={allAppointments} appointmentPositions={appointmentPositions} />
        ))}
      </div>
    </div>
  );
}
