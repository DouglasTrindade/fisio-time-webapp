"use client"

import type { ComponentType } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: ComponentType<{ className?: string }>
  isLoading?: boolean
  highlight?: string
}

export const MetricCard = ({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
  highlight,
}: MetricCardProps) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      )}
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      {highlight && !isLoading && (
        <p className="mt-2 text-xs font-medium text-emerald-600">
          {highlight}
        </p>
      )}
    </CardContent>
  </Card>
)
