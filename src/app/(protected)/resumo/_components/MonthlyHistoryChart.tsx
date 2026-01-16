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

type MonthlyHistoryEntry = {
  month: string
  income: number
  expense: number
}

interface MonthlyHistoryChartProps {
  data: MonthlyHistoryEntry[]
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
  minimumFractionDigits: 0,
})

export const MonthlyHistoryChart = ({ data }: MonthlyHistoryChartProps) => {
  const hasData = data.some((entry) => entry.income > 0 || entry.expense > 0)

  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <CardTitle>Histórico mensal</CardTitle>
        <CardDescription>Receitas e despesas registradas nos últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <AreaChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={70}
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
                strokeWidth={2}
                fill="var(--color-income)"
                fillOpacity={0.15}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--color-expense)"
                strokeWidth={2}
                fill="var(--color-expense)"
                fillOpacity={0.1}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
            Nenhuma receita ou despesa registrada nos últimos 12 meses.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
