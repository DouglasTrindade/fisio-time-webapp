import { useMemo } from "react";
import { CalendarX2 } from "lucide-react";
import { parseISO, format, endOfDay, startOfDay, isSameMonth } from "date-fns";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AgendaDayGroup } from "@/app/(protected)/agendamentos/_components/Calendar/components/agenda-view/agenda-day-group";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  singleDayAppointments: IAppointment[];
  multiDayAppointments: IAppointment[];
}

export function CalendarAgendaView({ singleDayAppointments, multiDayAppointments }: IProps) {
  const { selectedDate } = useCalendar();

  const appointmentsByDay = useMemo(() => {
    const allDates = new Map<string, { date: Date; appointments: IAppointment[]; multiDayAppointments: IAppointment[] }>();

    singleDayAppointments.forEach(appointment => {
      const appointmentDate = parseISO(appointment.startDate);
      if (!isSameMonth(appointmentDate, selectedDate)) return;

      const dateKey = format(appointmentDate, "yyyy-MM-dd");

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, { date: startOfDay(appointmentDate), appointments: [], multiDayAppointments: [] });
      }

      allDates.get(dateKey)?.appointments.push(appointment);
    });

    multiDayAppointments.forEach(appointment => {
      const appointmentStart = parseISO(appointment.startDate);
      const appointmentEnd = parseISO(appointment.endDate);

      let currentDate = startOfDay(appointmentStart);
      const lastDate = endOfDay(appointmentEnd);

      while (currentDate <= lastDate) {
        if (isSameMonth(currentDate, selectedDate)) {
          const dateKey = format(currentDate, "yyyy-MM-dd");

          if (!allDates.has(dateKey)) {
            allDates.set(dateKey, { date: new Date(currentDate), appointments: [], multiDayAppointments: [] });
          }

          allDates.get(dateKey)?.multiDayAppointments.push(appointment);
        }
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    });

    return Array.from(allDates.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [singleDayAppointments, multiDayAppointments, selectedDate]);

  const hasAnyAppointments = singleDayAppointments.length > 0 || multiDayAppointments.length > 0;

  return (
    <div className="h-[800px]">
      <ScrollArea className="h-full" type="always">
        <div className="space-y-6 p-4">
          {appointmentsByDay.map(dayGroup => (
            <AgendaDayGroup key={format(dayGroup.date, "yyyy-MM-dd")} date={dayGroup.date} appointments={dayGroup.appointments} multiDayAppointments={dayGroup.multiDayAppointments} />
          ))}

          {!hasAnyAppointments && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <CalendarX2 className="size-10" />
              <p className="text-sm md:text-base">Nenhum appointmento agendado para o mês selecionado</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
