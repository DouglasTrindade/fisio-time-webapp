"use client"

import { Pie, PieChart, Cell } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { FinanceCategoryEntry } from "@/types/reports"

const chartPalette = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

interface CategoryDistributionChartProps {
  title: string
  description: string
  data: FinanceCategoryEntry[]
  emptyLabel: string
  isLoading: boolean
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export const CategoryDistributionChart = ({
  title,
  description,
  data,
  emptyLabel,
  isLoading,
}: CategoryDistributionChartProps) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0)
  const hasData = total > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !hasData ? (
          <div className="h-[280px] animate-pulse rounded-lg border border-dashed border-border/60 bg-background/40" />
        ) : null}
        {!isLoading && !hasData ? (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : null}
        {hasData ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ChartContainer
              config={Object.fromEntries(
                data.map((entry, index) => [
                  entry.label,
                  { label: entry.label, color: chartPalette[index % chartPalette.length] },
                ]),
              )}
              className="mx-auto aspect-square max-h-[260px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => [
                        currency.format(Number(value)),
                        name,
                      ]}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={70}
                  strokeWidth={4}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.label} fill={chartPalette[index % chartPalette.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="space-y-3 text-sm">
              {data.map((entry, index) => (
                <div key={entry.label} className="space-y-1 rounded-lg border border-border/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{entry.label}</p>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currency.format(entry.value)} ·{" "}
                    {total ? `${((entry.value / total) * 100).toFixed(1)}%` : "0%"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
