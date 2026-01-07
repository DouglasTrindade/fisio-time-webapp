import { TreatmentPlans } from "./_components";
import { TreatmentPlansProvider } from "@/contexts/TreatmentPlansContext";

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

  return (
    <TreatmentPlansProvider
      initialFilters={
        initialPatientId ? { patientId: initialPatientId, page: 1 } : undefined
      }
    >
      <TreatmentPlans
        initialPatientId={initialPatientId}
        initialAttendanceId={initialAttendanceId}
        initialPatientName={initialPatientName}
      />
    </TreatmentPlansProvider>
  );
};

export default TreatmentsPage;
