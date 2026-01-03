"use client"

import type { PatientFilters } from "@/app/types/patient"

export const patientsCrudConfig = {
  endpoint: "/patients",
  defaultFilters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
} satisfies { endpoint: string; defaultFilters: PatientFilters }
