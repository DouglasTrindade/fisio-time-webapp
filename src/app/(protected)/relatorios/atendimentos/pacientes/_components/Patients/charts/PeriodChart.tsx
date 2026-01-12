"use client"

import { format } from "date-fns"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp } from "lucide-react"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { PatientAttendanceReport } from "@/types/reports"
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"

const attendanceChartConfig = {
  evaluations: {
    label: "Avaliações",
    color: "hsl(var(--chart-1))",
  },
  evolutions: {
    label: "Evoluções",
    color: "hsl(var(--chart-2))",
  },
  averagePerPatient: {
    label: "Média por paciente",
    color: "hsl(var(--chart-3))",
  },
}

interface PeriodChartProps {
  report?: PatientAttendanceReport | null
  rangeLabel?: string
}

export const PeriodChart = ({ report, rangeLabel }: PeriodChartProps) => {
  const hasData = Boolean(report && report.series.length > 0)

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Atendimentos no período</CardTitle>
        <CardDescription>Comparativo diário com média por paciente</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={attendanceChartConfig} className="h-80 w-full">
            <AreaChart accessibilityLayer data={report!.series} margin={{ left: -20, right: 12, top: 10 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => format(new Date(value), "dd/MM")}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} width={40} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="evaluations"
                type="natural"
                fill="var(--color-evaluations)"
                fillOpacity={0.4}
                stroke="var(--color-evaluations)"
                stackId="a"
              />
              <Area
                dataKey="evolutions"
                type="natural"
                fill="var(--color-evolutions)"
                fillOpacity={0.4}
                stroke="var(--color-evolutions)"
                stackId="a"
              />
              <Line
                type="natural"
                dataKey="averagePerPatient"
                stroke="var(--color-averagePerPatient)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            Nenhum atendimento no período.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            Média diária de {report?.summary.averagePerDay ?? "—"} atendimentos
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex items-center gap-2 leading-none">{rangeLabel}</div>
        </div>
      </CardFooter>
    </Card>
  )
}
