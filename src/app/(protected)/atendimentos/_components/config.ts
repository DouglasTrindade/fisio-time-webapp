"use client"

import type { AttendanceFilters } from "@/app/types/attendance"

export const attendancesCrudConfig = {
  endpoint: "/attendances",
  defaultFilters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "date",
    sortOrder: "desc",
    type: undefined,
  },
} satisfies { endpoint: string; defaultFilters: AttendanceFilters }
