"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CitiesAttendanceReport } from "@/app/types/reports"

interface CitiesTableProps {
  report?: CitiesAttendanceReport | null
  isLoading?: boolean
}

export const CitiesTable = ({ report, isLoading }: CitiesTableProps) => {
  const cities = report?.cities ?? []
  const hasData = cities.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cidades atendidas</CardTitle>
        <CardDescription>Principais localidades no período</CardDescription>
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
