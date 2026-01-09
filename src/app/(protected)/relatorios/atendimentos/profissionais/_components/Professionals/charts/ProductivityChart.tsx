"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ProfessionalsAttendanceReport } from "@/app/types/reports"

const chartConfig = {
  attendances: {
    label: "Atendimentos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface ProductivityChartProps {
  report?: ProfessionalsAttendanceReport | null
  isLoading?: boolean
}

export const ProductivityChart = ({ report, isLoading }: ProductivityChartProps) => {
  const data = report?.professionals.slice(0, 10) ?? []
  const hasData = data.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtividade por profissional</CardTitle>
        <CardDescription>Top 10 em atendimentos no período</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <BarChart data={data} layout="vertical" barSize={16}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="attendances" fill="var(--color-attendances)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            {isLoading ? "Carregando dados..." : "Nenhum atendimento registrado."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
