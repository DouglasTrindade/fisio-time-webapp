"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinanceOverviewSummary } from "@/types/reports"

interface StatusBreakdownCardProps {
  summary?: FinanceOverviewSummary
  isLoading: boolean
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const ProgressBar = ({ value, total, color }: { value: number; total: number; color: string }) => {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0

  return (
    <div className="h-2 w-full rounded-full bg-muted/40">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  )
}

export const StatusBreakdownCard = ({ summary, isLoading }: StatusBreakdownCardProps) => {
  if (isLoading && !summary) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Situação financeira</CardTitle>
          <CardDescription>Pagamentos confirmados x previstos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] animate-pulse rounded-lg border border-dashed border-border/60 bg-background/40" />
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Situação financeira</CardTitle>
          <CardDescription>Pagamentos confirmados x previstos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma transação encontrada para o período.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Situação financeira</CardTitle>
        <CardDescription>Pagamentos confirmados x previstos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
            <span>Receitas</span>
            <span>Total: {currency.format(summary.totalIncome)}</span>
          </div>
          <ProgressBar value={summary.paidIncome} total={summary.totalIncome} color="hsl(var(--chart-1))" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pagas</span>
            <strong className="text-foreground">{currency.format(summary.paidIncome)}</strong>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pendentes</span>
            <strong className="text-foreground">{currency.format(summary.pendingIncome)}</strong>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
            <span>Despesas</span>
            <span>Total: {currency.format(summary.totalExpenses)}</span>
          </div>
          <ProgressBar value={summary.paidExpenses} total={summary.totalExpenses} color="hsl(var(--chart-2))" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pagas</span>
            <strong className="text-foreground">{currency.format(summary.paidExpenses)}</strong>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Previstas</span>
            <strong className="text-foreground">{currency.format(summary.pendingExpenses)}</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
