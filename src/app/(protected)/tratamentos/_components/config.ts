"use client"

import type { TreatmentPlanFilters } from "@/types/treatment-plan";

export const treatmentPlansCrudConfig = {
  endpoint: "/treatment-plans",
  defaultFilters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    patientId: "",
    attendanceId: "",
  },
} satisfies { endpoint: string; defaultFilters: TreatmentPlanFilters };
