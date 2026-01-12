import { Suspense } from "react"
import { ProfessionalsReport } from "./_components/Professionals"
import { ReportPageSkeleton } from "@/app/(protected)/components/loading-fallbacks"

export default function ProfessionalsReportPage() {
  return (
    <Suspense fallback={<ReportPageSkeleton />}>
      <ProfessionalsReport />
    </Suspense>
  )
}
