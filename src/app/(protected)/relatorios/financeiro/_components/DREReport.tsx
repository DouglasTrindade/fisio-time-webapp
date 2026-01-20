"use client"

import { useMemo } from "react"

import { ReportHeader } from "@/app/(protected)/relatorios/components/ReportHeader"
import {
  SummaryCards,
  type SummaryCardData,
} from "@/app/(protected)/relatorios/components/SummaryCards"
import { useFinanceOverviewReport } from "./hooks/useFinanceOverview"
import { DREBreakdownCard } from "./DREBreakdownCard"
import { DREHighlightsCard } from "./DREHighlightsCard"

export const DREReport = () => {
  const {
    report,
    isLoading,
    isError,
    error,
    timeframeLabel,
    range,
    handleRangeChange,
    timeframes,
    formatCurrency,
  } = useFinanceOverviewReport()

  const cards = useMemo<SummaryCardData[]>(() => {
    if (!report) {
      return []
    }

    const { dre } = report

    return [
      {
        label: "Receita bruta",
        value: formatCurrency(dre.grossRevenue),
        helper: "Total de receitas registradas",
      },
      {
        label: "Receita líquida",
        value: formatCurrency(dre.netRevenue),
        helper: "Após deduções e pendências",
      },
      {
        label: "Despesas operacionais",
        value: formatCurrency(dre.operationalExpenses),
        helper: "Todas as despesas reconhecidas",
      },
      {
        label: "Resultado líquido",
        value: formatCurrency(dre.netIncome),
        helper: dre.netIncome >= 0 ? "Período lucrativo" : "Período deficitário",
      },
    ]
  }, [report, formatCurrency])

  const cardsToRender =
    isLoading && !report ? Array.from({ length: 4 }, () => null) : cards

  return (
    <section className="space-y-6">
      <ReportHeader
        sectionLabel="Relatórios · Financeiro"
        title="Demonstrativo de Resultados (DRE)"
        description="Acompanhe o desempenho financeiro consolidado por período."
        timeframeLabel={timeframeLabel}
        range={range}
        timeframes={timeframes}
        onRangeChange={handleRangeChange}
      />

      {isError ? (
        <p className="text-destructive">
          {error?.message ?? "Não foi possível carregar o relatório."}
        </p>
      ) : null}

      <SummaryCards cards={cardsToRender} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DREBreakdownCard dre={report?.dre} isLoading={isLoading} />
        <DREHighlightsCard
          dre={report?.dre}
          summary={report?.summary}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}
