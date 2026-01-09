"use client"

import type { PatientAttendanceReport } from "@/app/types/reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface HighlightsCardProps {
  report?: PatientAttendanceReport | null
  rangeLabel?: string
}

export const HighlightsCard = ({ report, rangeLabel }: HighlightsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Destaques rápidos</CardTitle>
        <CardDescription>Insights extraídos do período</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="rounded-lg border border-white/5 bg-gradient-to-br from-primary/10 to-transparent p-3">
          <p className="text-xs uppercase tracking-wide text-primary">Paciente mais frequente</p>
          <p className="text-lg font-semibold text-foreground">
            {report?.patients[0]?.name ?? "Sem dados"}
          </p>
          <p>
            {report?.patients[0]
              ? `${report.patients[0].attendances} atend.${report.patients[0].attendances > 1 ? "s" : ""}`
              : "Aguardando registros"}
          </p>
        </div>
        <div className="rounded-lg border border-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Média de atendimentos</p>
          <p className="text-lg font-semibold text-foreground">{report?.summary.averagePerDay ?? "—"}/dia</p>
          <p>em {rangeLabel?.toLowerCase()}</p>
        </div>
        <div className="rounded-lg border border-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pacientes únicos</p>
          <p className="text-lg font-semibold text-foreground">
            {report?.summary.attendedPatients ?? "—"}
          </p>
          <p>{report?.summary.totalAttendances ?? 0} atendimentos totais</p>
        </div>
      </CardContent>
    </Card>
  )
}
