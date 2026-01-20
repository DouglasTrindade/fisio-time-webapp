"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReportHeaderProps {
  sectionLabel?: string
  title: string
  description: string
  timeframeLabel: string
  range: number
  timeframes: ReadonlyArray<{ label: string; value: number }>
  onRangeChange: (value: string) => void
}

export const ReportHeader = ({
  sectionLabel = "Relatórios · Atendimentos",
  title,
  description,
  timeframeLabel,
  range,
  timeframes,
  onRangeChange,
}: ReportHeaderProps) => {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-primary/80 tracking-wide uppercase">{sectionLabel}</p>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right text-xs text-muted-foreground">
          <p>Período analisado</p>
          <p className="text-sm font-medium text-foreground">{timeframeLabel}</p>
        </div>
        <Select value={String(range)} onValueChange={onRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Intervalo" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  )
}
