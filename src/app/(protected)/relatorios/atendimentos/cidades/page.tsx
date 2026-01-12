import { Suspense } from "react"
import { CitiesReport } from "./_components/Cities"
import { ReportPageSkeleton } from "@/app/(protected)/components/loading-fallbacks"

export default function CitiesReportPage() {
  return (
    <Suspense fallback={<ReportPageSkeleton />}>
      <CitiesReport />
    </Suspense>
  )
}
