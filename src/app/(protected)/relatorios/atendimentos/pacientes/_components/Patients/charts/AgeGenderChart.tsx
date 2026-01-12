"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { PatientAttendanceReport } from "@/types/reports"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const ageChartConfig = {
  masculino: { label: "Masculino", color: "hsl(var(--chart-1))" },
  feminino: { label: "Feminino", color: "hsl(var(--chart-2))" },
  outro: { label: "Outro", color: "hsl(var(--chart-4))" },
  naoInformado: { label: "Não informado", color: "hsl(var(--chart-5))" },
}

interface AgeGenderChartProps {
  report?: PatientAttendanceReport | null
  isLoading: boolean
}

export const AgeGenderChart = ({ report, isLoading }: AgeGenderChartProps) => {
  const hasData = Boolean(report && report.ageGender.length > 0)

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Atendimentos por idade e gênero</CardTitle>
        <CardDescription>Empilhado por faixa etária</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {hasData ? (
          <ChartContainer config={ageChartConfig} className="h-[320px] w-full">
            <BarChart accessibilityLayer data={report!.ageGender}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="range"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => value.replace(" ", "")}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              {Object.entries(ageChartConfig).map(([key, config]) => (
                <Bar key={key} dataKey={key} stackId="age" fill={config.color} radius={4} />
              ))}
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-muted-foreground">
            {isLoading ? "Carregando distribuição..." : "Sem registros para o período selecionado."}
          </div>
        )}
      </CardContent>
      {report ? (
        <CardFooter className="text-xs text-muted-foreground">
          Total de {report.summary.totalAttendances} atendimentos distribuídos entre{" "}
          {report.summary.attendedPatients} pacientes no período.
        </CardFooter>
      ) : null}
    </Card>
  )
}
