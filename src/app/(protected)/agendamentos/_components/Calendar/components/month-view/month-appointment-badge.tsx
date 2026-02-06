import { cva } from "class-variance-authority";
import { endOfDay, format, isSameDay, parseISO, startOfDay } from "date-fns";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { DraggableAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/components/dnd/draggable-appointment";
import { AppointmentDetailsDialog } from "@/app/(protected)/agendamentos/_components/Calendar/components/dialogs/appointment-details-dialog";

import { cn } from "@/lib/utils";
import { appDateLocale } from "@/lib/date-locale";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";
import type { VariantProps } from "class-variance-authority";

const appointmentBadgeVariants = cva(
  "mx-1 flex size-auto h-6.5 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
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
        gray: "border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.appointment-dot]:fill-neutral-600",

        // Dot variants
        "blue-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-blue-600",
        "green-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-green-600",
        "red-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-red-600",
        "yellow-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-yellow-600",
        "purple-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-purple-600",
        "orange-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-orange-600",
        "gray-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.appointment-dot]:fill-neutral-600",
      },
      multiDayPosition: {
        first: "relative z-10 mr-0 w-[calc(100%_-_3px)] rounded-r-none border-r-0 [&>span]:mr-2.5",
        middle: "relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0",
        last: "ml-0 rounded-l-none border-l-0",
        none: "",
      },
    },
    defaultVariants: {
      color: "blue-dot",
    },
  }
);

interface IProps extends Omit<VariantProps<typeof appointmentBadgeVariants>, "color" | "multiDayPosition"> {
  appointment: IAppointment;
  cellDate: Date;
  appointmentCurrentDay?: number;
  appointmentTotalDays?: number;
  className?: string;
  position?: "first" | "middle" | "last" | "none";
}

export function MonthAppointmentBadge({ appointment, cellDate, appointmentCurrentDay, appointmentTotalDays, className, position: propPosition }: IProps) {
  const { badgeVariant } = useCalendar();

  const itemStart = startOfDay(parseISO(appointment.startDate));
  const itemEnd = endOfDay(parseISO(appointment.endDate));

  if (cellDate < itemStart || cellDate > itemEnd) return null;

  let position: "first" | "middle" | "last" | "none" | undefined;

  if (propPosition) {
    position = propPosition;
  } else if (appointmentCurrentDay && appointmentTotalDays) {
    position = "none";
  } else if (isSameDay(itemStart, itemEnd)) {
    position = "none";
  } else if (isSameDay(cellDate, itemStart)) {
    position = "first";
  } else if (isSameDay(cellDate, itemEnd)) {
    position = "last";
  } else {
    position = "middle";
  }

  const renderBadgeText = ["first", "none"].includes(position);

  const color = (badgeVariant === "dot" ? `${appointment.color}-dot` : appointment.color) as VariantProps<typeof appointmentBadgeVariants>["color"];

  const appointmentBadgeClasses = cn(appointmentBadgeVariants({ color, multiDayPosition: position, className }));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) e.currentTarget.click();
    }
  };

  return (
    <DraggableAppointment appointment={appointment}>
      <AppointmentDetailsDialog appointment={appointment}>
        <div role="button" tabIndex={0} className={appointmentBadgeClasses} onKeyDown={handleKeyDown}>
          <div className="flex items-center gap-1.5 truncate">
            {!["middle", "last"].includes(position) && ["mixed", "dot"].includes(badgeVariant) && (
              <svg width="8" height="8" viewBox="0 0 8 8" className="appointment-dot shrink-0">
                <circle cx="4" cy="4" r="4" />
              </svg>
            )}

            {renderBadgeText && (
              <p className="flex-1 truncate font-semibold">
                {appointmentCurrentDay && (
                  <span className="text-xs">
                    Dia {appointmentCurrentDay} de {appointmentTotalDays} •{" "}
                  </span>
                )}
                {appointment.title}
              </p>
            )}
          </div>

          {renderBadgeText && <span>{format(new Date(appointment.startDate), "HH:mm", { locale: appDateLocale })}</span>}
        </div>
      </AppointmentDetailsDialog>
    </DraggableAppointment>
  );
}
