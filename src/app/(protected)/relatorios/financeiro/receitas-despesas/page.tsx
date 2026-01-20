import { Suspense } from "react"

import { ReportPageSkeleton } from "@/app/(protected)/components/loading-fallbacks"
import { RevenueExpenseReport } from "../_components"

export default function RevenueVsExpensePage() {
  return (
    <Suspense fallback={<ReportPageSkeleton />}>
      <RevenueExpenseReport />
    </Suspense>
  )
}
