"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ProfessionalsAttendanceReport } from "@/app/types/reports"

interface ProfessionalsTableProps {
  report?: ProfessionalsAttendanceReport | null
  isLoading?: boolean
}

export const ProfessionalsTable = ({ report, isLoading }: ProfessionalsTableProps) => {
  const professionals = report?.professionals ?? []
  const hasData = professionals.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profissionais atendendo</CardTitle>
        <CardDescription>Distribuição completa de atendimentos</CardDescription>
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
