import { parseISO, isWithinInterval, differenceInDays, startOfDay, endOfDay } from "date-fns";

import { MonthAppointmentBadge } from "@/app/(protected)/agendamentos/_components/Calendar/components/month-view/month-appointment-badge";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  selectedDate: Date;
  multiDayAppointments: IAppointment[];
}

export function DayViewMultiDayAppointmentsRow({ selectedDate, multiDayAppointments }: IProps) {
  const dayStart = startOfDay(selectedDate);
  const dayEnd = endOfDay(selectedDate);

  const multiDayAppointmentsInDay = multiDayAppointments
    .filter(appointment => {
      const appointmentStart = parseISO(appointment.startDate);
      const appointmentEnd = parseISO(appointment.endDate);

      const isOverlapping =
        isWithinInterval(dayStart, { start: appointmentStart, end: appointmentEnd }) ||
        isWithinInterval(dayEnd, { start: appointmentStart, end: appointmentEnd }) ||
        (appointmentStart <= dayStart && appointmentEnd >= dayEnd);

      return isOverlapping;
    })
    .sort((a, b) => {
      const durationA = differenceInDays(parseISO(a.endDate), parseISO(a.startDate));
      const durationB = differenceInDays(parseISO(b.endDate), parseISO(b.startDate));
      return durationB - durationA;
    });

  if (multiDayAppointmentsInDay.length === 0) return null;

  return (
    <div className="flex border-b">
      <div className="w-18"></div>
      <div className="flex flex-1 flex-col gap-1 border-l py-1">
        {multiDayAppointmentsInDay.map(appointment => {
          const appointmentStart = startOfDay(parseISO(appointment.startDate));
          const appointmentEnd = startOfDay(parseISO(appointment.endDate));
          const currentDate = startOfDay(selectedDate);

          const appointmentTotalDays = differenceInDays(appointmentEnd, appointmentStart) + 1;
          const appointmentCurrentDay = differenceInDays(currentDate, appointmentStart) + 1;

          return <MonthAppointmentBadge key={appointment.id} appointment={appointment} cellDate={selectedDate} appointmentCurrentDay={appointmentCurrentDay} appointmentTotalDays={appointmentTotalDays} />;
        })}
      </div>
    </div>
  );
}
