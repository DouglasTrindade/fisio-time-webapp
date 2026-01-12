"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProfessionalsAttendanceReport } from "@/types/reports"

interface HighlightsCardProps {
  report?: ProfessionalsAttendanceReport | null
  isLoading?: boolean
  rangeLabel?: string
}

export const HighlightsCard = ({ report, isLoading, rangeLabel }: HighlightsCardProps) => {
  const topProfessional = report?.professionals[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Destaques do período</CardTitle>
        <CardDescription>{rangeLabel ?? "Período selecionado"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProfessional ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Top performer
            </p>
            <p className="text-2xl font-semibold text-foreground">{topProfessional.name}</p>
            <p className="text-sm text-muted-foreground">
              {topProfessional.attendances} atendimentos · {topProfessional.evaluations} avaliações · {" "}
              {topProfessional.evolutions} evoluções
            </p>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            {isLoading ? "Carregando destaques..." : "Nenhum profissional com atendimentos no período."}
          </div>
        )}

        {report ? (
          <div className="grid gap-4 rounded-lg border border-white/5 bg-white/5 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Profissionais ativos</span>
              <span className="font-semibold text-foreground">{report.summary.activeProfessionals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Novos profissionais</span>
              <span className="font-semibold text-foreground">{report.summary.newProfessionals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avaliações registradas</span>
              <span className="font-semibold text-foreground">{report.summary.evaluations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Evoluções registradas</span>
              <span className="font-semibold text-foreground">{report.summary.evolutions}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
