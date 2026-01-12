"use client"

import { useMemo } from "react"
import type { Attendance } from "@/types/attendance"
import type { ExportColumn } from "@/hooks/exportUtils"
import {
  formatAttendanceDate,
  formatAttendanceTime,
  getAttendanceTypeLabel,
} from "./utils"

export const useAttendanceExportColumns = () => {
  return useMemo<ExportColumn<Attendance>[]>(() => [
    {
      header: "Tipo",
      accessor: (attendance) => getAttendanceTypeLabel(attendance.type),
    },
    {
      header: "Data",
      accessor: (attendance) => formatAttendanceDate(attendance.date),
    },
    {
      header: "Hora",
      accessor: (attendance) => formatAttendanceTime(attendance.date),
    },
    {
      header: "Paciente",
      accessor: (attendance) => attendance.patient?.name ?? "",
    },
    {
      header: "Profissional",
      accessor: (attendance) => attendance.professional?.name ?? "",
    },
    {
      header: "CID",
      accessor: (attendance) =>
        attendance.cidCode
          ? `${attendance.cidCode}${attendance.cidDescription ? ` - ${attendance.cidDescription}` : ""}`
          : "",
    },
    {
      header: "Observações",
      accessor: (attendance) => attendance.observations ?? "",
    },
  ], [])
}
