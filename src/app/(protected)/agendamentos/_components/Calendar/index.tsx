"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/types/appointment"
import { Status } from "@prisma/client"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarProps {
  appointments: Appointment[]
  selectedDate: Date | null
  isLoading?: boolean
  onDateSelect: (date: Date) => void
  onCreateFromDate?: (date: Date) => void
  onEventClick?: (appointment: Appointment) => void
  onCreateNew?: () => void
}

const statusAccentMap: Record<Status, string> = {
  [Status.CONFIRMED]: "from-emerald-500/80 to-emerald-400/60 text-emerald-50",
  [Status.WAITING]: "from-sky-500/80 to-sky-400/60 text-sky-50",
  [Status.RESCHEDULED]: "from-amber-500/80 to-amber-400/60 text-amber-900",
  [Status.CANCELED]: "from-rose-500/80 to-rose-400/60 text-rose-50",
}

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export const Calendar = ({
  appointments,
  selectedDate,
  isLoading,
  onDateSelect,
  onCreateFromDate,
  onEventClick,
  onCreateNew,
}: CalendarProps) => {
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    startOfMonth(selectedDate ?? new Date()),
  )

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(startOfMonth(selectedDate))
    }
  }, [selectedDate])

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [visibleMonth])

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, Appointment[]>()
    appointments.forEach((appointment) => {
      const dateKey = format(new Date(appointment.date), "yyyy-MM-dd")
      const current = grouped.get(dateKey) ?? []
      current.push(appointment)
      grouped.set(dateKey, current)
    })
    return grouped
  }, [appointments])

  const handleMonthChange = (direction: "prev" | "next") => {
    setVisibleMonth((current) => addMonths(current, direction === "prev" ? -1 : 1))
  }

  const handleDayClick = (day: Date) => {
    onDateSelect(day)
    onCreateFromDate?.(day)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/5 bg-[#06070f] p-4 text-white shadow-[0_20px_80px_-60px_rgba(0,0,0,0.9)]">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-white/5 bg-transparent text-xs uppercase tracking-[0.3em] text-white hover:bg-white/5"
            onClick={() => {
              const today = new Date()
              setVisibleMonth(startOfMonth(today))
              handleDayClick(today)
            }}
          >
            Hoje
          </Button>
          <div className="flex items-center rounded-2xl border border-white/10 bg-black/20 px-2 py-1 text-sm">
            <button
              type="button"
              className="rounded-xl px-3 py-1 text-lg hover:text-primary"
              onClick={() => handleMonthChange("prev")}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-4 text-base font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {format(visibleMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              type="button"
              className="rounded-xl px-3 py-1 text-lg hover:text-primary"
              onClick={() => handleMonthChange("next")}
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-2 text-xs text-muted-foreground">
            {appointments.length} agendamento{appointments.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {dayLabels.map((label) => (
          <div key={label} className="rounded-xl border border-white/5 bg-black/20 py-3">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd")
          const dailyEvents = eventsByDay.get(dateKey) ?? []
          const displayedEvents = dailyEvents.slice(0, 3)
          const remaining = dailyEvents.length - displayedEvents.length

          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isCurrentMonth = isSameMonth(day, visibleMonth)

          return (
            <div
              key={dateKey}
              role="button"
              tabIndex={0}
              onClick={() => handleDayClick(day)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  handleDayClick(day)
                }
              }}
              className={cn(
                "flex h-32 flex-col rounded-2xl border border-white/5 bg-[#0d0f1b] p-3 text-left text-white shadow-[0_25px_70px_-70px_rgba(0,0,0,0.95)] transition hover:border-white/15 focus-visible:outline-2 focus-visible:outline-primary/40",
                !isCurrentMonth && "opacity-40",
                isSelected && "border-primary/70 bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-base font-semibold text-white">
                  {format(day, "d", { locale: ptBR })}
                </span>
                {isToday(day) ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-primary">
                    Hoje
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-1 flex-col gap-1 overflow-hidden">
                {displayedEvents.map((event) => {
                  const timeLabel = format(new Date(event.date), "HH:mm")
                  return (
                    <div
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      onClick={(eventClick) => {
                        eventClick.stopPropagation()
                        onEventClick?.(event)
                      }}
                      onKeyDown={(eventClick) => {
                        if (eventClick.key === "Enter" || eventClick.key === " ") {
                          eventClick.preventDefault()
                          eventClick.stopPropagation()
                          onEventClick?.(event)
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1 rounded-lg px-2 text-[0.7rem] font-medium",
                        "bg-linear-to-r",
                        statusAccentMap[event.status] ?? "from-slate-500/80 to-slate-400/60 text-white",
                      )}
                    >
                      <span className="truncate">
                        {timeLabel} · {event.name}
                      </span>
                    </div>
                  )
                })}
                {remaining > 0 ? (
                  <div className="text-[11px] font-medium text-muted-foreground">
                    +{remaining} atividade{remaining > 1 ? "s" : ""}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {isLoading ? (
        <p className="text-center text-xs text-muted-foreground">Carregando agenda...</p>
      ) : null}
    </section>
  )
}
