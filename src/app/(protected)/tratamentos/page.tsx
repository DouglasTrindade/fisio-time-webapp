import { Suspense } from "react";
import { TreatmentPlans } from "./_components";
import { RecordsPageSkeleton } from "@/app/(protected)/components/loading-fallbacks";

interface TreatmentsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const TreatmentsPage = async ({ searchParams }: TreatmentsPageProps) => {
  const params = (await searchParams) ?? {};
  const identify = (value?: string | string[] | null) =>
    Array.isArray(value) ? value[0] : value ?? undefined;

  const initialPatientId = identify(params.patientId ?? null);
  const initialAttendanceId = identify(params.attendanceId ?? null);
  const initialPatientName = identify(params.patientName ?? null) ?? null;
  const initialAttendanceLabel = identify(params.attendanceLabel ?? null) ?? null;

  return (
    <Suspense fallback={<RecordsPageSkeleton />}>
      <TreatmentPlans
        initialPatientId={initialPatientId}
        initialAttendanceId={initialAttendanceId}
        initialPatientName={initialPatientName}
        initialAttendanceLabel={initialAttendanceLabel}
      />
    </Suspense>
  );
};

export default TreatmentsPage;
