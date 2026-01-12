"use client"

import { MapPin } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CitiesAttendanceReport } from "@/types/reports"

interface HighlightsCardProps {
  report?: CitiesAttendanceReport | null
}

export const HighlightsCard = ({ report }: HighlightsCardProps) => {
  const topCity = report?.summary.topCity

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Destaques geográficos</CardTitle>
        <CardDescription>Insights rápidos sobre alcance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCity ? (
          <div className="rounded-lg border border-white/5 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cidade com mais atendimentos
            </p>
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="text-lg font-semibold text-foreground">{topCity.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {topCity.attendances} atendimentos no período
            </p>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            Nenhuma cidade em destaque.
          </div>
        )}

        {report ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cidades visitadas</span>
              <span className="font-semibold text-foreground">{report.summary.visitedCities}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cobertura</span>
              <span className="font-semibold text-foreground">{report.summary.coveragePercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cidades em crescimento</span>
              <span className="font-semibold text-foreground">{report.summary.citiesWithGrowth}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
