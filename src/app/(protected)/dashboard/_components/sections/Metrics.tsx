"use client"

import { Users, UserPlus, CalendarClock, AlertTriangle } from "lucide-react"
import { MetricCard } from "../components/MetricCard"
import { NEW_PATIENT_WINDOW_DAYS } from "../dashboardConstants"

interface MetricsSectionProps {
  totalPatients: number
  newPatients: number
  todayAppointmentsCount: number
  missedAppointments: number
  isLoading: boolean
}

export const MetricsSection = ({
  totalPatients,
  newPatients,
  todayAppointmentsCount,
  missedAppointments,
  isLoading,
}: MetricsSectionProps) => (
  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <MetricCard
      title="Total de pacientes"
      value={totalPatients}
      description="Pacientes ativos na base"
      icon={Users}
      isLoading={isLoading}
    />
    <MetricCard
      title="Novos nas últimas semanas"
      value={newPatients}
      description={`Janela de ${NEW_PATIENT_WINDOW_DAYS} dias`}
      icon={UserPlus}
      isLoading={isLoading}
    />
    <MetricCard
      title="Agendamentos de hoje"
      value={todayAppointmentsCount}
      description="Inclui todos os profissionais"
      icon={CalendarClock}
      isLoading={isLoading}
    />
    <MetricCard
      title="Agendamentos perdidos"
      value={missedAppointments}
      description="Marcados como no-show"
      icon={AlertTriangle}
      isLoading={isLoading}
      highlight={missedAppointments === 0 ? "Excelente aproveitamento!" : undefined}
    />
  </section>
)
