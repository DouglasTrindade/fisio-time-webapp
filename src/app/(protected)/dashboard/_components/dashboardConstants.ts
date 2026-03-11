import {
  CalendarRange,
  ClipboardList,
  Stethoscope,
  UsersRound,
} from "lucide-react"
import { Status } from "@prisma/client"
import type { ChartConfig } from "@/components/ui/chart"

export const DAY_IN_MS = 1000 * 60 * 60 * 24
export const NEW_PATIENT_WINDOW_DAYS = 21
export const INACTIVE_THRESHOLD_DAYS = 30
export const BIRTHDAY_WINDOW_DAYS = 14

export const QUICK_ACTIONS = [
  {
    title: "Agendamentos",
    description: "Confirme, reagende e acompanhe o dia",
    href: "/agendamentos",
    icon: CalendarRange,
    badge: "Agenda do dia",
  },
  {
    title: "Pacientes",
    description: "Cadastre e gerencie seus pacientes",
    href: "/pacientes",
    icon: UsersRound,
    badge: "Base completa",
  },
  {
    title: "Atendimentos",
    description: "Registre evoluções e avaliações",
    href: "/atendimentos",
    icon: Stethoscope,
    badge: "Clínico",
  },
  {
    title: "Planos de tratamento",
    description: "Crie e acompanhe os planos ativos",
    href: "/tratamentos",
    icon: ClipboardList,
    badge: "Tratamentos",
  },
] as const

export const APPOINTMENT_TREND_CHART_CONFIG = {
  scheduled: {
    label: "Agendados",
    color: "hsl(var(--chart-2))",
  },
  confirmed: {
    label: "Confirmados",
    color: "hsl(var(--chart-1))",
  },
  canceled: {
    label: "Cancelados",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export const STATUS_STYLE: Record<
  Status,
  { label: string; badgeClass: string }
> = {
  [Status.CONFIRMED]: {
    label: "Confirmado",
    badgeClass: "bg-emerald-100 text-emerald-800",
  },
  [Status.CANCELED]: {
    label: "Cancelado",
    badgeClass: "bg-rose-100 text-rose-800",
  },
  [Status.RESCHEDULED]: {
    label: "Reagendado",
    badgeClass: "bg-amber-100 text-amber-800",
  },
  [Status.WAITING]: {
    label: "Aguardando",
    badgeClass: "bg-sky-100 text-sky-800",
  },
}
