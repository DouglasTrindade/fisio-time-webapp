"use client"

import { useMemo } from "react"
import type { PatientAttendanceReport, PatientAttendanceRow } from "@/types/reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet } from "lucide-react"
import type { ExportColumn } from "@/hooks/exportUtils"
import { useExportCsv } from "@/hooks/useExportCsv"
import { useExportXlsx } from "@/hooks/useExportXlsx"

interface PatientsTableProps {
  report?: PatientAttendanceReport | null
  isLoading: boolean
}

export const PatientsTable = ({ report, isLoading }: PatientsTableProps) => {
  const rows = report?.patients ?? []
  const hasPatients = rows.length > 0
  const exportColumns = useMemo<ExportColumn<PatientAttendanceRow>[]>(
    () => [
      { header: "Paciente", accessor: (patient) => patient.name },
      { header: "Idade", accessor: (patient) => (patient.age ? `${patient.age} anos` : "—") },
      { header: "Atendimentos", accessor: (patient) => patient.attendances },
    ],
    [],
  )

  const exportCsv = useExportCsv<PatientAttendanceRow>()
  const exportXlsx = useExportXlsx<PatientAttendanceRow>()

  const handleExportCsv = () => {
    exportCsv(rows, exportColumns, { filename: "relatorio-pacientes" })
  }

  const handleExportXlsx = () => {
    exportXlsx(rows, exportColumns, {
      filename: "relatorio-pacientes",
      sheetName: "Pacientes",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Pacientes atendidos</CardTitle>
          <CardDescription>Ordenado por volume de atendimentos no período</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!hasPatients}
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportXlsx}
            disabled={!hasPatients}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            XLSX
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasPatients ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead className="text-right">Atendimentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 8).map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.age ? `${patient.age} anos` : "—"}</TableCell>
                    <TableCell className="text-right">{patient.attendances}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length > 8 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Exibindo 8 de {rows.length} pacientes.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            {isLoading ? "Buscando pacientes..." : "Nenhum paciente atendido nesse recorte."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
