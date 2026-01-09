"use client"

import type { PatientAttendanceReport } from "@/app/types/reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PatientsTableProps {
  report?: PatientAttendanceReport | null
  isLoading: boolean
}

export const PatientsTable = ({ report, isLoading }: PatientsTableProps) => {
  const hasPatients = Boolean(report && report.patients.length > 0)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Pacientes atendidos</CardTitle>
          <CardDescription>Ordenado por volume de atendimentos no período</CardDescription>
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
                {report!.patients.slice(0, 8).map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.age ? `${patient.age} anos` : "—"}</TableCell>
                    <TableCell className="text-right">{patient.attendances}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {report!.patients.length > 8 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Exibindo 8 de {report!.patients.length} pacientes.
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
