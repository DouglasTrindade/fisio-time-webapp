"use client"

import { Pie, PieChart, Cell } from "recharts"
import { TrendingUp } from "lucide-react"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { PatientAttendanceReport } from "@/types/reports"
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"

const genderChartConfig = {
  Masculino: "hsl(var(--chart-1))",
  Feminino: "hsl(var(--chart-2))",
  Outro: "hsl(var(--chart-4))",
  "Não informado": "hsl(var(--chart-5))",
}

interface GenderChartProps {
  report?: PatientAttendanceReport | null
  isLoading: boolean
}

export const GenderChart = ({ report, isLoading }: GenderChartProps) => {
  const total = report?.genderDistribution.reduce((sum, entry) => sum + entry.value, 0) ?? 0
  const hasData = Boolean(report && total > 0)

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Atendimentos por gênero</CardTitle>
        <CardDescription>Representatividade no período selecionado</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            config={Object.fromEntries(
              Object.keys(genderChartConfig).map((label) => [
                label,
                { label, color: genderChartConfig[label as keyof typeof genderChartConfig] },
              ]),
            )}
            className="mx-auto aspect-square max-h-[260px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={report!.genderDistribution}
                dataKey="value"
                nameKey="label"
                innerRadius={70}
                strokeWidth={4}
              >
                {report!.genderDistribution.map((entry) => (
                  <Cell key={entry.label} fill={genderChartConfig[entry.label as keyof typeof genderChartConfig]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            {isLoading ? "Conectando ao relatório..." : "Ainda não há dados suficientes."}
          </div>
        )}
      </CardContent>
      {report ? (
        <CardFooter className="flex-col items-start gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            Distribuição estável no período <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="grid gap-2">
            {report.genderDistribution.map((entry) => (
              <div key={entry.label} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: genderChartConfig[entry.label as keyof typeof genderChartConfig],
                  }}
                />
                <span>
                  {entry.label}:{" "}
                  <span className="font-medium text-foreground">
                    {total ? ((entry.value / total) * 100).toFixed(0) : 0}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </CardFooter>
      ) : null}
    </Card>
  )
}
