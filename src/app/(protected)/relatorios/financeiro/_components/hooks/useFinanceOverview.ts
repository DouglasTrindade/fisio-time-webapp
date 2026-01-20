"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format, subDays } from "date-fns"

import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { FinanceOverviewReport } from "@/types/reports"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export const financeTimeframes = [
  { label: "Últimos 30 dias", value: 30 },
  { label: "Últimos 90 dias", value: 90 },
  { label: "Últimos 180 dias", value: 180 },
] as const

const fetchFinanceOverview = async (params: { start: string; end: string }) => {
  const search = new URLSearchParams(params).toString()
  const response = await apiRequest<ApiResponse<FinanceOverviewReport>>(
    `/reports/finance/overview?${search}`,
  )

  if (!response.success || !response.data) {
    throw new Error(
      response.error ?? "Não foi possível carregar os dados financeiros.",
    )
  }

  return response.data
}

export const useFinanceOverviewReport = () => {
  const [range, setRange] = useState<number>(90)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = subDays(end, range - 1)
    return { start: start.toISOString(), end: end.toISOString() }
  })

  const handleRangeChange = (value: string) => {
    const days = Number(value)
    const end = new Date()
    const start = subDays(end, days - 1)
    setRange(days)
    setDateRange({ start: start.toISOString(), end: end.toISOString() })
  }

  const { data, isLoading, isFetching, isError, error } = useQuery<
    FinanceOverviewReport,
    Error
  >({
    queryKey: ["finance-overview-report", dateRange],
    queryFn: () => fetchFinanceOverview(dateRange),
    placeholderData: (previousData) => previousData,
  })

  const timeframeLabel = useMemo(() => {
    if (!data) {
      return "—"
    }

    return `${format(
      new Date(data.timeframe.start),
      "dd/MM/yyyy",
    )} · ${format(new Date(data.timeframe.end), "dd/MM/yyyy")}`
  }, [data])

  const formatCurrency = (value: number) => currencyFormatter.format(value)

  return {
    report: data,
    isLoading: isLoading || isFetching,
    isError,
    error,
    timeframeLabel,
    range,
    handleRangeChange,
    timeframes: financeTimeframes,
    formatCurrency,
  }
}
