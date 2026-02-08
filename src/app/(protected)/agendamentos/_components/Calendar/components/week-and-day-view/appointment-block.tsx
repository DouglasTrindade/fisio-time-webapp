import { cva } from "class-variance-authority";
import { format, differenceInMinutes, parseISO } from "date-fns";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { DraggableAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/components/dnd/draggable-appointment";
import { AppointmentDetailsDialog } from "@/app/(protected)/agendamentos/_components/Calendar/components/dialogs/appointment-details-dialog";

import { cn } from "@/lib/utils";
import { appDateLocale } from "@/lib/date-locale";

import type { HTMLAttributes } from "react";
import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";
import type { VariantProps } from "class-variance-authority";

const calendarWeekAppointmentCardVariants = cva(
  "flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      color: {
        // Colored and mixed variants
        blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&_.appointment-dot]:fill-blue-600",
        green: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&_.appointment-dot]:fill-green-600",
        red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&_.appointment-dot]:fill-red-600",
        yellow: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&_.appointment-dot]:fill-yellow-600",
        purple: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 [&_.appointment-dot]:fill-purple-600",
        orange: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 [&_.appointment-dot]:fill-orange-600",
        gray: "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.appointment-dot]:fill-neutral-600",

        // Dot variants
        "blue-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-blue-600",
        "green-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-green-600",
        "red-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-red-600",
        "orange-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-orange-600",
        "purple-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-purple-600",
        "yellow-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-yellow-600",
        "gray-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-neutral-600",
      },
    },
    defaultVariants: {
      color: "blue-dot",
    },
  }
);

interface IProps extends HTMLAttributes<HTMLDivElement>, Omit<VariantProps<typeof calendarWeekAppointmentCardVariants>, "color"> {
  appointment: IAppointment;
}

export function AppointmentBlock({ appointment, className }: IProps) {
  const { badgeVariant } = useCalendar();

  const start = parseISO(appointment.startDate);
  const end = parseISO(appointment.endDate);
  const durationInMinutes = differenceInMinutes(end, start);
  const heightInPixels = (durationInMinutes / 60) * 96 - 8;

  const color = (badgeVariant === "dot" ? `${appointment.color}-dot` : appointment.color) as VariantProps<typeof calendarWeekAppointmentCardVariants>["color"];

  const calendarWeekAppointmentCardClasses = cn(calendarWeekAppointmentCardVariants({ color, className }), durationInMinutes < 35 && "py-0 justify-center");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) e.currentTarget.click();
    }
  };

  return (
    <DraggableAppointment appointment={appointment}>
      <AppointmentDetailsDialog appointment={appointment}>
        <div role="button" tabIndex={0} className={calendarWeekAppointmentCardClasses} style={{ height: `${heightInPixels}px` }} onKeyDown={handleKeyDown}>
          <div className="flex items-center gap-1.5 truncate">
            {["mixed", "dot"].includes(badgeVariant) && (
              <svg width="8" height="8" viewBox="0 0 8 8" className="appointment-dot shrink-0">
                <circle cx="4" cy="4" r="4" />
              </svg>
            )}

            <p className="truncate font-semibold">{appointment.title}</p>
          </div>

          {durationInMinutes > 25 && (
            <p>
              {format(start, "HH:mm", { locale: appDateLocale })} - {format(end, "HH:mm", { locale: appDateLocale })}
            </p>
          )}
        </div>
      </AppointmentDetailsDialog>
    </DraggableAppointment>
  );
}
