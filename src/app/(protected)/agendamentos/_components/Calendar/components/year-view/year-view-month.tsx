import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay, parseISO, getDaysInMonth, startOfMonth } from "date-fns";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";
import { appDateLocale } from "@/lib/date-locale";

import { YearViewDayCell } from "@/app/(protected)/agendamentos/_components/Calendar/components/year-view/year-view-day-cell";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  month: Date;
  appointments: IAppointment[];
}

export function YearViewMonth({ month, appointments }: IProps) {
  const { push } = useRouter();
  const { setSelectedDate } = useCalendar();

  const monthName = format(month, "MMMM", { locale: appDateLocale });

  const daysInMonth = useMemo(() => {
    const totalDays = getDaysInMonth(month);
    const firstDay = startOfMonth(month).getDay();

    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const blanks = Array(firstDay).fill(null);

    return [...blanks, ...days];
  }, [month]);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const handleClick = () => {
    setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1));
    push("/month-view");
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-t-lg border px-3 py-2 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {monthName}
      </button>

      <div className="flex-1 space-y-2 rounded-b-lg border border-t-0 p-3">
        <div className="grid grid-cols-7 gap-x-0.5 text-center">
          {weekDays.map((day, index) => (
            <div key={index} className="text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-x-0.5 gap-y-2">
          {daysInMonth.map((day, index) => {
            if (day === null) return <div key={`blank-${index}`} className="h-10" />;

            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const dayAppointments = appointments.filter(appointment => isSameDay(parseISO(appointment.startDate), date) || isSameDay(parseISO(appointment.endDate), date));

            return <YearViewDayCell key={`day-${day}`} day={day} date={date} appointments={dayAppointments} />;
          })}
        </div>
      </div>
    </div>
  );
}
