"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { APPOINTMENT_TREND_CHART_CONFIG } from "../dashboardConstants"

interface AppointmentTrendSectionProps {
  isLoading: boolean
  data: Array<{
    key: string
    label: string
    scheduled: number
    confirmed: number
    canceled: number
  }>
}

export const AppointmentTrendSection = ({
  isLoading,
  data,
}: AppointmentTrendSectionProps) => {
  const hasData = data.some((entry) => entry.scheduled > 0)

  return (
    <section>
      <Card className="border-border/70 bg-card/85 shadow-sm">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Tendência de atendimentos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Comparativo dos últimos 7 dias por status
            </p>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/relatorios/atendimentos/profissionais">Ver relatórios</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : hasData ? (
            <ChartContainer
              config={APPOINTMENT_TREND_CHART_CONFIG}
              className="h-[280px] w-full"
            >
              <AreaChart data={data} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={12} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `${value as number} atend.`,
                        APPOINTMENT_TREND_CHART_CONFIG[
                          name as keyof typeof APPOINTMENT_TREND_CHART_CONFIG
                        ]?.label ?? name,
                      ]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent className="pt-4" />} />
                <Area
                  type="monotone"
                  dataKey="confirmed"
                  stroke="var(--color-confirmed)"
                  fill="var(--color-confirmed)"
                  fillOpacity={0.25}
                  strokeWidth={3}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="scheduled"
                  stroke="var(--color-scheduled)"
                  fill="var(--color-scheduled)"
                  fillOpacity={0.12}
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="canceled"
                  stroke="var(--color-canceled)"
                  fill="var(--color-canceled)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
              Ainda não há dados suficientes para exibir o gráfico.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
