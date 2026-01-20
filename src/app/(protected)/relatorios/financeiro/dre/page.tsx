import { Suspense } from "react"

import { ReportPageSkeleton } from "@/app/(protected)/components/loading-fallbacks"
import { DREReport } from "../_components"

export default function DREPage() {
  return (
    <Suspense fallback={<ReportPageSkeleton />}>
      <DREReport />
    </Suspense>
  )
}
