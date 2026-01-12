import { Suspense } from "react";
import { PatientsReport } from "./_components/Patients";
import { ReportPageSkeleton } from "@/app/(protected)/components/loading-fallbacks";

export default function PatientsReportPage() {
  return (
    <Suspense fallback={<ReportPageSkeleton />}>
      <PatientsReport />
    </Suspense>
  );
}
