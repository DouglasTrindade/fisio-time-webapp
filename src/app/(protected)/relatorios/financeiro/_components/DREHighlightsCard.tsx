"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinanceDRESection, FinanceOverviewSummary } from "@/types/reports"

interface DREHighlightsCardProps {
  dre?: FinanceDRESection
  summary?: FinanceOverviewSummary
  isLoading: boolean
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const formatPercent = (value: number) =>
  Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "—"

export const DREHighlightsCard = ({ dre, summary, isLoading }: DREHighlightsCardProps) => {
  if (isLoading && (!dre || !summary)) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Indicadores de resultado</CardTitle>
          <CardDescription>Margens calculadas a partir do período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] animate-pulse rounded-lg border border-dashed border-border/60 bg-background/40" />
        </CardContent>
      </Card>
    )
  }

  if (!dre || !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de resultado</CardTitle>
          <CardDescription>Margens calculadas a partir do período</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sem dados suficientes para calcular os indicadores.</p>
        </CardContent>
      </Card>
    )
  }

  const operationalMargin =
    dre.netRevenue > 0 ? dre.operationalResult / dre.netRevenue : Number.NaN
  const netMargin =
    dre.grossRevenue > 0 ? dre.netIncome / dre.grossRevenue : Number.NaN
  const payoutRatio =
    summary.totalExpenses > 0 ? summary.paidExpenses / summary.totalExpenses : Number.NaN

  const items = [
    {
      label: "Margem operacional",
      value: formatPercent(operationalMargin),
      helper: "Resultado operacional ÷ receita líquida",
      trendPositive: operationalMargin >= 0,
    },
    {
      label: "Margem líquida",
      value: formatPercent(netMargin),
      helper: "Resultado líquido ÷ receita bruta",
      trendPositive: netMargin >= 0,
    },
    {
      label: "Execução de despesas",
      value: formatPercent(payoutRatio),
      helper: "Despesas pagas ÷ despesas totais",
      trendPositive: payoutRatio <= 1,
    },
    {
      label: "Saldo acumulado",
      value: currency.format(summary.balance),
      helper: "Receitas - despesas",
      trendPositive: summary.balance >= 0,
    },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Indicadores de resultado</CardTitle>
        <CardDescription>Margens e execução calculadas a partir do período</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between rounded-lg border border-border/40 p-3 text-sm"
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="text-lg font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.helper}</p>
            </div>
            {item.trendPositive ? (
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-400" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
