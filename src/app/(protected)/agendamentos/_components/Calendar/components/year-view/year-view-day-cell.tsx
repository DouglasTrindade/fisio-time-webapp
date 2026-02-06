import { isToday } from "date-fns";
import { useRouter } from "next/navigation";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { cn } from "@/lib/utils";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  day: number;
  date: Date;
  appointments: IAppointment[];
}

export function YearViewDayCell({ day, date, appointments }: IProps) {
  const { push } = useRouter();
  const { setSelectedDate } = useCalendar();

  const maxIndicators = 3;
  const appointmentCount = appointments.length;

  const handleClick = () => {
    setSelectedDate(date);
    push("/day-view");
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="flex h-11 flex-1 flex-col items-center justify-start gap-0.5 rounded-md pt-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-xs font-medium",
          isToday(date) && "bg-primary font-semibold text-primary-foreground"
        )}
      >
        {day}
      </div>

      {appointmentCount > 0 && (
        <div className="mt-0.5 flex gap-0.5">
          {appointmentCount <= maxIndicators ? (
            appointments.map(appointment => (
              <div
                key={appointment.id}
                className={cn(
                  "size-1.5 rounded-full",
                  appointment.color === "blue" && "bg-blue-600",
                  appointment.color === "green" && "bg-green-600",
                  appointment.color === "red" && "bg-red-600",
                  appointment.color === "yellow" && "bg-yellow-600",
                  appointment.color === "purple" && "bg-purple-600",
                  appointment.color === "orange" && "bg-orange-600",
                  appointment.color === "gray" && "bg-neutral-600"
                )}
              />
            ))
          ) : (
            <>
              <div
                className={cn(
                  "size-1.5 rounded-full",
                  appointments[0].color === "blue" && "bg-blue-600",
                  appointments[0].color === "green" && "bg-green-600",
                  appointments[0].color === "red" && "bg-red-600",
                  appointments[0].color === "yellow" && "bg-yellow-600",
                  appointments[0].color === "purple" && "bg-purple-600",
                  appointments[0].color === "orange" && "bg-orange-600"
                )}
              />
              <span className="text-[7px] text-muted-foreground">+{appointmentCount - 1}</span>
            </>
          )}
        </div>
      )}
    </button>
  );
}
