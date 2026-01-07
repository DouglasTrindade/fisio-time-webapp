import type { HistoryEntry } from "./types"

export const typeCopy: Record<HistoryEntry["type"], string> = {
  evaluation: "Avaliação",
  evolution: "Evolução",
}

export const typeColors: Record<
  HistoryEntry["type"],
  {
    badge: string
    dot: string
    accent: string
  }
> = {
  evaluation: {
    badge: "bg-blue-500/15 text-blue-500 dark:text-blue-400",
    dot: "bg-blue-500",
    accent: "text-blue-400",
  },
  evolution: {
    badge: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400",
    dot: "bg-emerald-500",
    accent: "text-emerald-400",
  },
}

export const emptyFallback = (value?: string | null, fallback = "Não informado") => {
  if (!value) return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

export const formatDate = (
  value?: string | Date | null,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }
) => {
  if (!value) return "-"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("pt-BR", options).format(date)
}

export const formatDateTime = (value?: string | Date | null) =>
  formatDate(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

export const calculateAge = (birthDate?: string | null) => {
  if (!birthDate) return null
  const date = new Date(birthDate)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const monthDifference = today.getMonth() - date.getMonth()
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1
  }
  return age
}
