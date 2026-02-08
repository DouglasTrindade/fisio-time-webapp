import Link from "next/link";
import { Columns, Grid3x3, List, Plus, Grid2x2, CalendarRange } from "lucide-react";

import { Button } from "@/components/ui/button";

import { UserSelect } from "@/app/(protected)/agendamentos/_components/Calendar/components/header/user-select";
import { TodayButton } from "@/app/(protected)/agendamentos/_components/Calendar/components/header/today-button";
import { DateNavigator } from "@/app/(protected)/agendamentos/_components/Calendar/components/header/date-navigator";
import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";
import type { TCalendarView } from "@/app/(protected)/agendamentos/_components/Calendar/types";

interface IProps {
  view: TCalendarView;
  appointments: IAppointment[];
  onViewChange?: (view: TCalendarView) => void;
}

export function CalendarHeader({ view, appointments, onViewChange }: IProps) {
  const { selectedDate, createAppointment } = useCalendar();

  const handleCreateClick = () => {
    if (selectedDate) {
      createAppointment(selectedDate);
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator view={view} appointments={appointments} />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            <Button
              aria-label="Ver por dia"
              size="icon"
              variant={view === "day" ? "default" : "outline"}
              className="rounded-r-none [&_svg]:size-5"
              onClick={() => onViewChange?.("day")}
            >
              {onViewChange ? (
                <List strokeWidth={1.8} />
              ) : (
                <Link href="?view=day" scroll={false}>
                  <List strokeWidth={1.8} />
                </Link>
              )}
            </Button>

            <Button
              aria-label="Ver por semana"
              size="icon"
              variant={view === "week" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => onViewChange?.("week")}
            >
              {onViewChange ? (
                <Columns strokeWidth={1.8} />
              ) : (
                <Link href="?view=week" scroll={false}>
                  <Columns strokeWidth={1.8} />
                </Link>
              )}
            </Button>

            <Button
              aria-label="Ver por mês"
              size="icon"
              variant={view === "month" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => onViewChange?.("month")}
            >
              {onViewChange ? (
                <Grid2x2 strokeWidth={1.8} />
              ) : (
                <Link href="?view=month" scroll={false}>
                  <Grid2x2 strokeWidth={1.8} />
                </Link>
              )}
            </Button>

            <Button
              aria-label="Ver por ano"
              size="icon"
              variant={view === "year" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => onViewChange?.("year")}
            >
              {onViewChange ? (
                <Grid3x3 strokeWidth={1.8} />
              ) : (
                <Link href="?view=year" scroll={false}>
                  <Grid3x3 strokeWidth={1.8} />
                </Link>
              )}
            </Button>

            <Button
              aria-label="Ver por agenda"
              size="icon"
              variant={view === "agenda" ? "default" : "outline"}
              className="-ml-px rounded-l-none [&_svg]:size-5"
              onClick={() => onViewChange?.("agenda")}
            >
              {onViewChange ? (
                <CalendarRange strokeWidth={1.8} />
              ) : (
                <Link href="?view=agenda" scroll={false}>
                  <CalendarRange strokeWidth={1.8} />
                </Link>
              )}
            </Button>
          </div>

          <UserSelect />
        </div>

        <Button className="w-full sm:w-auto" onClick={handleCreateClick}>
          <Plus />
          Novo agendamento
        </Button>
      </div>
    </div>
  );
}
