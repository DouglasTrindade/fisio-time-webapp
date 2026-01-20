"use client"

import { useMemo } from "react"

import { ReportHeader } from "@/app/(protected)/relatorios/components/ReportHeader"
import {
  SummaryCards,
  type SummaryCardData,
} from "@/app/(protected)/relatorios/components/SummaryCards"
import { useFinanceOverviewReport } from "./hooks/useFinanceOverview"
import { RevenueExpenseHistoryChart } from "./charts/RevenueExpenseHistoryChart"
import { CategoryDistributionChart } from "./charts/CategoryDistributionChart"
import { StatusBreakdownCard } from "./StatusBreakdownCard"

export const RevenueExpenseReport = () => {
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

  const summaryCards = useMemo<SummaryCardData[]>(() => {
    if (!report) {
      return []
    }

    const { summary } = report

    return [
      {
        label: "Receitas registradas",
        value: formatCurrency(summary.totalIncome),
        helper: `Pagas: ${formatCurrency(summary.paidIncome)} · Pendentes: ${formatCurrency(summary.pendingIncome)}`,
      },
      {
        label: "Despesas registradas",
        value: formatCurrency(summary.totalExpenses),
        helper: `Pagas: ${formatCurrency(summary.paidExpenses)} · Previstas: ${formatCurrency(summary.pendingExpenses)}`,
      },
      {
        label: "Resultado líquido",
        value: formatCurrency(summary.balance),
        helper:
          summary.balance >= 0
            ? "Período superavitário"
            : "Período deficitário",
      },
      {
        label: "Margem operacional",
        value:
          summary.totalIncome > 0
            ? `${((summary.balance / summary.totalIncome) * 100).toFixed(1)}%`
            : "—",
        helper: "Saldo vs receita total",
      },
    ]
  }, [report, formatCurrency])

  const cardsToRender =
    isLoading && !report ? Array.from({ length: 4 }, () => null) : summaryCards

  return (
    <section className="space-y-6">
      <ReportHeader
        sectionLabel="Relatórios · Financeiro"
        title="Receitas x Despesas"
        description="Visualize o fluxo de entradas e saídas e identifique oportunidades de otimização."
        timeframeLabel={timeframeLabel}
        range={range}
        timeframes={[...timeframes]}
        onRangeChange={handleRangeChange}
      />

      {isError ? (
        <p className="text-destructive">
          {error?.message ?? "Não foi possível carregar o relatório."}
        </p>
      ) : null}

      <SummaryCards cards={cardsToRender} />

      <div className="grid gap-4 lg:grid-cols-3">
        <RevenueExpenseHistoryChart
          data={report?.history ?? []}
          isLoading={isLoading}
        />
        <StatusBreakdownCard summary={report?.summary} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryDistributionChart
          title="Receitas por categoria"
          description="Principais origens de receita no período"
          data={report?.incomeByCategory ?? []}
          emptyLabel="Ainda não há receitas categorizadas neste período."
          isLoading={isLoading}
        />
        <CategoryDistributionChart
          title="Despesas por categoria"
          description="Áreas que mais consomem recursos"
          data={report?.expenseByCategory ?? []}
          emptyLabel="Ainda não há despesas categorizadas neste período."
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}
