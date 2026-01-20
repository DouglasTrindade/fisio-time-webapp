"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { FinanceHistoryEntry } from "@/types/reports"

interface RevenueExpenseHistoryChartProps {
  data: FinanceHistoryEntry[]
  isLoading: boolean
}

const chartConfig = {
  income: {
    label: "Receitas",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Despesas",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export const RevenueExpenseHistoryChart = ({ data, isLoading }: RevenueExpenseHistoryChartProps) => {
  const hasData = data.some((entry) => entry.income > 0 || entry.expense > 0)

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Fluxo histórico</CardTitle>
        <CardDescription>Receitas e despesas registradas no período selecionado</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading && !hasData ? (
          <div className="h-[320px] animate-pulse rounded-lg border border-dashed border-border/60 bg-background/40" />
        ) : null}
        {!isLoading && !hasData ? (
          <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
            Nenhum lançamento encontrado para o período.
          </div>
        ) : null}
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <AreaChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={80}
                tickFormatter={(value) => currency.format(value).replace("R$", "").trim()}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      currency.format(Number(value)),
                      chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                    ]}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                fill="var(--color-income)"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--color-expense)"
                fill="var(--color-expense)"
                fillOpacity={0.1}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        ) : null}
      </CardContent>
    </Card>
  )
}
