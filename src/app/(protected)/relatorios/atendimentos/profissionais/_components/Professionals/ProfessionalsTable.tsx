"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet } from "lucide-react"
import type { ProfessionalsAttendanceReport, ProfessionalPerformanceEntry } from "@/types/reports"
import type { ExportColumn } from "@/hooks/exportUtils"
import { useExportCsv } from "@/hooks/useExportCsv"
import { useExportXlsx } from "@/hooks/useExportXlsx"

interface ProfessionalsTableProps {
  report?: ProfessionalsAttendanceReport | null
  isLoading?: boolean
}

export const ProfessionalsTable = ({ report, isLoading }: ProfessionalsTableProps) => {
  const professionals = report?.professionals ?? []
  const hasData = professionals.length > 0

  const exportColumns = useMemo<ExportColumn<ProfessionalPerformanceEntry>[]>(
    () => [
      { header: "Profissional", accessor: (professional) => professional.name },
      { header: "Avaliações", accessor: (professional) => professional.evaluations },
      { header: "Evoluções", accessor: (professional) => professional.evolutions },
      { header: "Total", accessor: (professional) => professional.attendances },
      {
        header: "Duração média",
        accessor: (professional) => professional.averageDuration ?? "—",
      },
    ],
    [],
  )

  const exportCsv = useExportCsv<ProfessionalPerformanceEntry>()
  const exportXlsx = useExportXlsx<ProfessionalPerformanceEntry>()

  const handleExportCsv = () => {
    exportCsv(professionals, exportColumns, { filename: "relatorio-profissionais" })
  }

  const handleExportXlsx = () => {
    exportXlsx(professionals, exportColumns, {
      filename: "relatorio-profissionais",
      sheetName: "Profissionais",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Profissionais atendendo</CardTitle>
          <CardDescription>Distribuição completa de atendimentos</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!hasData}
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportXlsx}
            disabled={!hasData}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            XLSX
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead className="text-right">Avaliações</TableHead>
                  <TableHead className="text-right">Evoluções</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.slice(0, 12).map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">{professional.name}</TableCell>
                    <TableCell className="text-right">{professional.evaluations}</TableCell>
                    <TableCell className="text-right">{professional.evolutions}</TableCell>
                    <TableCell className="text-right">{professional.attendances}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            {isLoading ? "Carregando profissionais..." : "Sem atendimentos registrados neste período."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
