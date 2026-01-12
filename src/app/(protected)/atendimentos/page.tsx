import { Suspense } from "react"
import { Attendances } from "./_components"
import { RecordsPageSkeleton } from "@/app/(protected)/components/loading-fallbacks"

const AttendancesPage = () => {
  return (
    <Suspense fallback={<RecordsPageSkeleton />}>
      <Attendances />
    </Suspense>
  )
}

export default AttendancesPage
