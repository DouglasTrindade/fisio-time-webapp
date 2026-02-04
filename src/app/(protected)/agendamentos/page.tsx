import { Status } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ClientContainer } from "@/calendar/components/client-container";
import { ChangeBadgeVariantInput } from "@/calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/calendar/components/change-working-hours-input";
import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TCalendarView, TEventColor } from "@/calendar/types";

const EVENT_COLOR_BY_STATUS: Record<Status, TEventColor> = {
  CONFIRMED: "green",
  WAITING: "yellow",
  RESCHEDULED: "purple",
  CANCELED: "red",
};

const VIEWS: TCalendarView[] = ["day", "week", "month", "year", "agenda"];

const isCalendarView = (value: string | undefined): value is TCalendarView => {
  return !!value && VIEWS.includes(value as TCalendarView);
};

const DEFAULT_EVENT_DURATION_MINUTES = 60;

async function getCalendarData() {
  const [appointments, professionals] = await Promise.all([
    prisma.appointment.findMany({
      include: {
        User: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { date: "asc" },
      take: 500,
    }),
    prisma.user.findMany({
      select: { id: true, name: true, image: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const users: IUser[] = professionals.map((user) => ({
    id: user.id,
    name: user.name ?? "Profissional sem nome",
    picturePath: user.image ?? null,
  }));

  const events: IEvent[] = appointments.map((appointment) => {
    const startDate = appointment.date;
    const endDate = new Date(appointment.date.getTime() + DEFAULT_EVENT_DURATION_MINUTES * 60 * 1000);

    return {
      id: appointment.id,
      title: appointment.name,
      description: appointment.notes ?? "",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      color: EVENT_COLOR_BY_STATUS[appointment.status] ?? "blue",
      user: {
        id: appointment.professionalId,
        name: appointment.User?.name ?? "Profissional",
        picturePath: appointment.User?.image ?? null,
      },
    };
  });

  return { events, users };
}

const CalendarPage = async ({ searchParams }: { searchParams?: { view?: string } }) => {
  const { events, users } = await getCalendarData();
  const rawView = searchParams?.view;
  const view: TCalendarView = isCalendarView(rawView) ? rawView : "month";

  return (
    <CalendarProvider events={events} users={users}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 p-4">
        <ClientContainer view={view} />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChangeBadgeVariantInput />
          <ChangeVisibleHoursInput />
          <ChangeWorkingHoursInput />
        </div>
      </div>
    </CalendarProvider>
  );
};

export default CalendarPage;
