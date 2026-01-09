"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { subDays, format } from "date-fns"

import { apiRequest } from "@/app/services/api"
import type { ApiResponse } from "@/app/types/api"
import type { PatientAttendanceReport } from "@/app/types/reports"

import { ReportHeader } from "@/app/(protected)/relatorios/components/ReportHeader"
import {
  SummaryCards,
  type SummaryCardData,
} from "@/app/(protected)/relatorios/components/SummaryCards"
import { PeriodChart } from "./charts/PeriodChart"
import { GenderChart } from "./charts/GenderChart"
import { AgeGenderChart } from "./charts/AgeGenderChart"
import { HighlightsCard } from "./HighlightsCard"
import { PatientsTable } from "./PatientsTable"

const timeframes = [
  { label: "Últimos 30 dias", value: 30 },
  { label: "Últimos 90 dias", value: 90 },
  { label: "Últimos 180 dias", value: 180 },
]

async function fetchReport(params: { start: string; end: string }) {
  const search = new URLSearchParams(params).toString()
  const response = await apiRequest<ApiResponse<PatientAttendanceReport>>(
    `/reports/attendances/patients?${search}`,
  )

  if (!response.success || !response.data) {
    throw new Error(response.error ?? "Não foi possível carregar o relatório.")
  }

  return response.data
}

export const PatientsReport = () => {
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

  const { data, isLoading, isError, error } = useQuery<PatientAttendanceReport, Error>({
    queryKey: ["reports-attendances-patients", dateRange],
    queryFn: () => fetchReport(dateRange),
    placeholderData: (prevData) => prevData,
  })
  const report = data

  const summaryCards = useMemo<SummaryCardData[]>(() => {
    if (!report) {
      return []
    }

    return [
      {
        label: "Pacientes atendidos",
        value: report.summary.attendedPatients,
        helper: `${report.summary.patientsRegisteredInPeriod} novos no período`,
      },
      {
        label: "Atendimentos",
        value: report.summary.totalAttendances,
        helper: `${report.summary.averagePerDay} por dia`,
      },
      {
        label: "Avaliações × Evoluções",
        value: `${report.summary.evaluations} · ${report.summary.evolutions}`,
        helper: `${report.summary.averagePerPatient} por paciente`,
      },
      {
        label: "Agendamentos no período",
        value: report.summary.appointmentsInPeriod,
        helper: `Total de pacientes: ${report.summary.totalPatients}`,
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
        title="Pacientes"
        description="Analise atendimentos, perfil de pacientes e evolução por período."
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

      <div className="grid gap-4 lg:grid-cols-5">
        <PeriodChart
          report={report}
          rangeLabel={timeframes.find((option) => option.value === range)?.label}
        />
        <GenderChart report={report} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AgeGenderChart report={report} isLoading={isLoading} />
        <HighlightsCard report={report} rangeLabel={timeframes.find((item) => item.value === range)?.label} />
      </div>

      <PatientsTable report={report} isLoading={isLoading} />
    </section>
  )
}
