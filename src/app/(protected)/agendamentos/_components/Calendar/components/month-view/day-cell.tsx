import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { isToday, startOfDay } from "date-fns";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { AppointmentBullet } from "@/app/(protected)/agendamentos/_components/Calendar/components/month-view/appointment-bullet";
import { DroppableDayCell } from "@/app/(protected)/agendamentos/_components/Calendar/components/dnd/droppable-day-cell";
import { MonthAppointmentBadge } from "@/app/(protected)/agendamentos/_components/Calendar/components/month-view/month-appointment-badge";

import { cn } from "@/lib/utils";
import { getMonthCellAppointments } from "@/app/(protected)/agendamentos/_components/Calendar/helpers";

import type { ICalendarCell, IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  cell: ICalendarCell;
  appointments: IAppointment[];
  appointmentPositions: Record<string, number>;
}

const MAX_VISIBLE_APPOINTMENTS = 3;

export function DayCell({ cell, appointments, appointmentPositions }: IProps) {
  const { push } = useRouter();
  const { setSelectedDate } = useCalendar();

  const { day, currentMonth, date } = cell;

  const cellAppointments = useMemo(() => getMonthCellAppointments(date, appointments, appointmentPositions), [date, appointments, appointmentPositions]);
  const isSunday = date.getDay() === 0;

  const handleClick = () => {
    setSelectedDate(date);
    push("/day-view");
  };

  return (
    <DroppableDayCell cell={cell}>
      <div className={cn("flex h-full flex-col gap-1 border-l border-t py-1.5 lg:pb-2 lg:pt-1", isSunday && "border-l-0")}>
        <button
          onClick={handleClick}
          className={cn(
            "flex size-6 translate-x-1 items-center justify-center rounded-full text-xs font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:px-2",
            !currentMonth && "opacity-20",
            isToday(date) && "bg-primary font-bold text-primary-foreground hover:bg-primary"
          )}
        >
          {day}
        </button>

        <div className={cn("flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0", !currentMonth && "opacity-50")}>
          {[0, 1, 2].map(position => {
            const appointment = cellAppointments.find(e => e.position === position);
            const appointmentKey = appointment ? `appointment-${appointment.id}-${position}` : `empty-${position}`;

            return (
              <div key={appointmentKey} className="lg:flex-1">
                {appointment && (
                  <>
                    <AppointmentBullet className="lg:hidden" color={appointment.color} />
                    <MonthAppointmentBadge className="hidden lg:flex" appointment={appointment} cellDate={startOfDay(date)} />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {cellAppointments.length > MAX_VISIBLE_APPOINTMENTS && (
          <p className={cn("h-4.5 px-1.5 text-xs font-semibold text-muted-foreground", !currentMonth && "opacity-50")}>
            <span className="sm:hidden">+{cellAppointments.length - MAX_VISIBLE_APPOINTMENTS}</span>
            <span className="hidden sm:inline"> {cellAppointments.length - MAX_VISIBLE_APPOINTMENTS} mais...</span>
          </p>
        )}
      </div>
    </DroppableDayCell>
  );
}
