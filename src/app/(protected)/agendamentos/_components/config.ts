"use client"

import type { AppointmentFilters } from "@/app/types/appointment"

export const appointmentsCrudConfig = {
  endpoint: "/appointments",
  defaultFilters: {
    page: 1,
    limit: 100,
    sortBy: "date",
    sortOrder: "asc",
    date: undefined,
  },
} satisfies { endpoint: string; defaultFilters: AppointmentFilters }
