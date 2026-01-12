"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { CitiesAttendanceReport } from "@/types/reports"

const chartConfig = {
  attendances: {
    label: "Atendimentos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface TopCitiesChartProps {
  report?: CitiesAttendanceReport | null
  isLoading?: boolean
}

export const TopCitiesChart = ({ report, isLoading }: TopCitiesChartProps) => {
  const data = report?.cities.slice(0, 8) ?? []
  const hasData = data.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atendimentos por cidade</CardTitle>
        <CardDescription>Top 8 cidades no período</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={data} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="attendances" radius={4} fill="var(--color-attendances)" />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            {isLoading ? "Carregando..." : "Sem dados para o período selecionado."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
