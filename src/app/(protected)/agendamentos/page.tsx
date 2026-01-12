import { Suspense } from "react";
import { Appointments } from "./_components/index";
import { CalendarPageSkeleton } from "@/app/(protected)/components/loading-fallbacks";

const AppointmentsPage = async () => {
  return (
    <Suspense fallback={<CalendarPageSkeleton />}>
      <Appointments />
    </Suspense>
  );
};

export default AppointmentsPage;
