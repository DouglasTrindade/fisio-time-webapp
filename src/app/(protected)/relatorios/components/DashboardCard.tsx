"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardCardProps {
  label?: string | null
  value?: number | string | null
  helper?: string | null
  formatter?: (value: number | string | null | undefined) => string | number
}

const defaultFormatter = (value: DashboardCardProps["value"]) => {
  if (typeof value === "number") {
    return Intl.NumberFormat("pt-BR").format(value)
  }

  return value ?? "—"
}

export const DashboardCard = ({ label, value, helper, formatter = defaultFormatter }: DashboardCardProps) => {
  return (
    <Card className="bg-linear-to-b from-white/5 to-transparent border-white/5">
      <CardHeader className="space-y-1">
        <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
          {label ?? "Carregando..."}
        </CardDescription>
        <CardTitle className="text-3xl font-semibold text-foreground">
          {formatter(value)}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{helper ?? "Sincronizando dados..."}</p>
      </CardHeader>
    </Card>
  )
}
