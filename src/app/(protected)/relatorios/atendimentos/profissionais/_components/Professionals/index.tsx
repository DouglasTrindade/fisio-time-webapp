"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format, subDays } from "date-fns"

import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { ProfessionalsAttendanceReport } from "@/types/reports"
import { ReportHeader } from "@/app/(protected)/relatorios/components/ReportHeader"
import {
  SummaryCards,
  type SummaryCardData,
} from "@/app/(protected)/relatorios/components/SummaryCards"

import { ProductivityChart } from "./charts/ProductivityChart"
import { HighlightsCard } from "./HighlightsCard"
import { ProfessionalsTable } from "./ProfessionalsTable"

const timeframes = [
  { label: "Últimos 30 dias", value: 30 },
  { label: "Últimos 90 dias", value: 90 },
  { label: "Últimos 180 dias", value: 180 },
]

async function fetchProfessionalsReport(params: { start: string; end: string }) {
  const search = new URLSearchParams(params).toString()
  const response = await apiRequest<ApiResponse<ProfessionalsAttendanceReport>>(
    `/reports/attendances/professionals?${search}`,
  )

  if (!response.success || !response.data) {
    throw new Error(response.error ?? "Não foi possível carregar o relatório.")
  }

  return response.data
}

export const ProfessionalsReport = () => {
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

  const { data, isLoading, isError, error } = useQuery<ProfessionalsAttendanceReport, Error>({
    queryKey: ["reports-attendances-professionals", dateRange],
    queryFn: () => fetchProfessionalsReport(dateRange),
    placeholderData: (prevData) => prevData,
  })

  const report = data

  const summaryCards = useMemo<SummaryCardData[]>(() => {
    if (!report) {
      return []
    }

    return [
      {
        label: "Atendimentos no período",
        value: report.summary.totalAttendances,
        helper: `${report.summary.averagePerDay} por dia`,
      },
      {
        label: "Profissionais ativos",
        value: report.summary.activeProfessionals,
        helper: `${report.summary.newProfessionals} novos no período`,
      },
      {
        label: "Avaliações × Evoluções",
        value: `${report.summary.evaluations} · ${report.summary.evolutions}`,
        helper: "Distribuição por tipo de atendimento",
      },
      {
        label: "Tempo médio",
        value: report.summary.averageDuration ?? "—",
        helper: "Inclui todos os atendimentos",
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
        title="Profissionais"
        description="Monitore produtividade, alocação e evolução da equipe clínica."
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
        <ProductivityChart report={report} isLoading={isLoading} />
        <HighlightsCard report={report} isLoading={isLoading} rangeLabel={timeframes.find((item) => item.value === range)?.label} />
      </div>

      <ProfessionalsTable report={report} isLoading={isLoading} />
    </section>
  )
}
