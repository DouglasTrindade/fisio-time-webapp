import { useMemo } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getAppointmentsCount, navigateDate, rangeText } from "@/app/(protected)/agendamentos/_components/Calendar/helpers";
import { appDateLocale } from "@/lib/date-locale";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";
import type { TCalendarView } from "@/app/(protected)/agendamentos/_components/Calendar/types";

interface IProps {
  view: TCalendarView;
  appointments: IAppointment[];
}

export function DateNavigator({ view, appointments }: IProps) {
  const { selectedDate, setSelectedDate } = useCalendar();

  const month = format(selectedDate, "MMMM", { locale: appDateLocale });
  const monthLabel = month.charAt(0).toUpperCase() + month.slice(1);
  const year = selectedDate.getFullYear();

  const appointmentCount = useMemo(() => getAppointmentsCount(appointments, selectedDate, view), [appointments, selectedDate, view]);

  const handlePrevious = () => setSelectedDate(navigateDate(selectedDate, view, "previous"));
  const handleNext = () => setSelectedDate(navigateDate(selectedDate, view, "next"));

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {monthLabel} {year}
        </span>
        <Badge variant="outline" className="px-1.5">
          {appointmentCount} {appointmentCount === 1 ? "agendamento" : "agendamentos"}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="size-6.5 px-0 [&_svg]:size-4.5" onClick={handlePrevious}>
          <ChevronLeft />
        </Button>

        <p className="text-sm text-muted-foreground">{rangeText(view, selectedDate)}</p>

        <Button variant="outline" className="size-6.5 px-0 [&_svg]:size-4.5" onClick={handleNext}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
