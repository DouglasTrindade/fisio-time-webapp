"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AttendanceTypeChartProps {
  data: Array<{ label: string; total: number }>
}

const chartConfig = {
  total: {
    label: "Atendimentos",
    color: "hsl(var(--chart-1))",
  },
}

export const AttendanceTypeChart = ({ data }: AttendanceTypeChartProps) => {
  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <CardTitle>Atendimentos</CardTitle>
        <CardDescription>Distribuição entre avaliações e evoluções</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart data={data} barSize={32}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <ChartTooltip cursor={{ fill: "transparent" }} content={<ChartTooltipContent />} />
              <Bar
                dataKey="total"
                fill="var(--color-total)"
                radius={[8, 8, 0, 0]}
                label={{ position: "top", fill: "hsl(var(--foreground))" }}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
            Nenhum atendimento faturado até o momento.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
