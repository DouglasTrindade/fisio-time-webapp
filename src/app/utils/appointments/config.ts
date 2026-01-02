"use client"

import type { AppointmentFilters } from "@/app/utils/types/appointment"

export const appointmentsCrudConfig = {
  endpoint: "/appointments",
  defaultFilters: {
    date: undefined,
  },
} satisfies { endpoint: string; defaultFilters: AppointmentFilters }
