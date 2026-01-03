"use client"

import type { AppointmentFilters } from "@/app/types/appointment"

export const appointmentsCrudConfig = {
  endpoint: "/appointments",
  defaultFilters: {
    date: undefined,
  },
} satisfies { endpoint: string; defaultFilters: AppointmentFilters }
