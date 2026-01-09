"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { CitiesAttendanceReport } from "@/app/types/reports"

const chartConfig = {
  percentage: {
    label: "Crescimento",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface GrowthChartProps {
  report?: CitiesAttendanceReport | null
  isLoading?: boolean
}

export const GrowthChart = ({ report, isLoading }: GrowthChartProps) => {
  const hasData = Boolean(report && report.growth.length > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento por cidade</CardTitle>
        <CardDescription>Comparativo com o período anterior</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={report!.growth}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} width={50} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="percentage" stroke="var(--color-percentage)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            {isLoading ? "Carregando..." : "Sem dados de crescimento disponíveis."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
