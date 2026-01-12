"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet } from "lucide-react"
import type { CitiesAttendanceReport, CityAttendanceEntry } from "@/types/reports"
import type { ExportColumn } from "@/hooks/exportUtils"
import { useExportCsv } from "@/hooks/useExportCsv"
import { useExportXlsx } from "@/hooks/useExportXlsx"

interface CitiesTableProps {
  report?: CitiesAttendanceReport | null
  isLoading?: boolean
}

export const CitiesTable = ({ report, isLoading }: CitiesTableProps) => {
  const cities = report?.cities ?? []
  const hasData = cities.length > 0

  const exportColumns = useMemo<ExportColumn<CityAttendanceEntry>[]>(
    () => [
      { header: "Cidade", accessor: (city) => city.name },
      { header: "Estado", accessor: (city) => city.state ?? "—" },
      { header: "Atendimentos", accessor: (city) => city.attendances },
    ],
    [],
  )

  const exportCsv = useExportCsv<CityAttendanceEntry>()
  const exportXlsx = useExportXlsx<CityAttendanceEntry>()

  const handleExportCsv = () => {
    exportCsv(cities, exportColumns, { filename: "relatorio-cidades" })
  }

  const handleExportXlsx = () => {
    exportXlsx(cities, exportColumns, {
      filename: "relatorio-cidades",
      sheetName: "Cidades",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Cidades atendidas</CardTitle>
          <CardDescription>Principais localidades no período</CardDescription>
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
                  <TableHead>Cidade</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Atendimentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.slice(0, 10).map((city) => (
                  <TableRow key={`${city.name}-${city.state ?? ""}`}>
                    <TableCell className="font-medium">{city.name}</TableCell>
                    <TableCell>{city.state ?? "—"}</TableCell>
                    <TableCell className="text-right">{city.attendances}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            {isLoading ? "Carregando..." : "Sem cidades registradas neste período."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
