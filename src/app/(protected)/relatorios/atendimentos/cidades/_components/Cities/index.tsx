"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format, subDays } from "date-fns"

import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { CitiesAttendanceReport } from "@/types/reports"
import { ReportHeader } from "@/app/(protected)/relatorios/components/ReportHeader"
import {
  SummaryCards,
  type SummaryCardData,
} from "@/app/(protected)/relatorios/components/SummaryCards"

import { TopCitiesChart } from "./charts/TopCitiesChart"
import { GrowthChart } from "./charts/GrowthChart"
import { HighlightsCard } from "./HighlightsCard"
import { CitiesTable } from "./CitiesTable"

const timeframes = [
  { label: "Últimos 30 dias", value: 30 },
  { label: "Últimos 90 dias", value: 90 },
  { label: "Últimos 180 dias", value: 180 },
]

async function fetchCitiesReport(params: { start: string; end: string }) {
  const search = new URLSearchParams(params).toString()
  const response = await apiRequest<ApiResponse<CitiesAttendanceReport>>(
    `/reports/attendances/cities?${search}`,
  )

  if (!response.success || !response.data) {
    throw new Error(response.error ?? "Não foi possível carregar o relatório.")
  }

  return response.data
}

export const CitiesReport = () => {
  const [range, setRange] = useState<number>(30)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = subDays(end, 29)
    return { start: start.toISOString(), end: end.toISOString() }
  })

  const handleRangeChange = (value: string) => {
    const days = Number(value)
    const end = new Date()
    const start = subDays(end, days - 1)
    setRange(days)
    setDateRange({ start: start.toISOString(), end: end.toISOString() })
  }

  const { data, isLoading, isError, error } = useQuery<CitiesAttendanceReport, Error>({
    queryKey: ["reports-attendances-cities", dateRange],
    queryFn: () => fetchCitiesReport(dateRange),
    placeholderData: (prevData) => prevData,
  })
  const report = data

  const summaryCards = useMemo<SummaryCardData[]>(() => {
    if (!report) {
      return []
    }

    return [
      {
        label: "Atendimentos totais",
        value: report.summary.totalAttendances,
        helper: `${report.summary.visitedCities} cidades visitadas`,
      },
      {
        label: "Cidade em destaque",
        value: report.summary.topCity?.name ?? "—",
        helper: `${report.summary.topCity?.attendances ?? 0} atend.`,
      },
      {
        label: "Média por cidade",
        value: report.summary.averagePerCity,
        helper: `${report.summary.citiesWithGrowth} cidades em crescimento`,
      },
      {
        label: "Cobertura",
        value: `${report.summary.coveragePercentage}%`,
        helper: "Participação no total de cidades",
      },
    ]
  }, [report])

  const cardsToRender: Array<SummaryCardData | null> =
    isLoading && !report ? Array.from({ length: 4 }, () => null) : summaryCards

  const timeframeLabel = report
    ? `${format(new Date(report.timeframe.start), "dd/MM/yyyy")} · ${format(
        new Date(report.timeframe.end),
        "dd/MM/yyyy",
      )}`
    : "—"

  return (
    <section className="space-y-6">
      <ReportHeader
        title="Cidades"
        description="Compreenda a distribuição geográfica dos atendimentos e identifique oportunidades."
        timeframeLabel={timeframeLabel}
        range={range}
        onRangeChange={handleRangeChange}
        timeframes={timeframes}
      />

      {isError ? (
        <p className="text-destructive">
          {error?.message ?? "Não foi possível carregar o relatório."}
        </p>
      ) : null}

      <SummaryCards cards={cardsToRender} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TopCitiesChart report={report} isLoading={isLoading} />
        <GrowthChart report={report} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <HighlightsCard report={report} />
        <div className="lg:col-span-2">
          <CitiesTable report={report} isLoading={isLoading} />
        </div>
      </div>
    </section>
  )
}
