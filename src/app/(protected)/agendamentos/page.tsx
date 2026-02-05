import type { TCalendarView } from "@/app/(protected)/agendamentos/_components/Calendar/types";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import { CalendarPageClient } from "./_components";

const VIEWS: TCalendarView[] = ["day", "week", "month", "year", "agenda"];

const isCalendarView = (value: string | undefined): value is TCalendarView => {
  return !!value && VIEWS.includes(value as TCalendarView);
};

const CalendarPage = ({ searchParams }: { searchParams?: { view?: string } }) => {
  const rawView = searchParams?.view;
  const view: TCalendarView = isCalendarView(rawView) ? rawView : "month";

  return (
    <AppointmentsProvider>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 p-4">
        <CalendarPageClient view={view} />
      </div>
    </AppointmentsProvider>
  );
};

export default CalendarPage;
