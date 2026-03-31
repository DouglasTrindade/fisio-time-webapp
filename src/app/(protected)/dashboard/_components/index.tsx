"use client"

import { useMemo } from "react"
import { useRecords } from "@/hooks/useRecords"
import type { Patient } from "@/types/patient"
import type { Appointment } from "@/types/appointment"
import { getAppointmentTrendData, getDashboardMetrics, toDateKey } from "./dashboardUtils"
import { QuickActionsSection } from "./sections/QuickActions"
import { MetricsSection } from "./sections/Metrics"
import { AppointmentTrendSection } from "./sections/AppointmentTrend"
import { TodayAgendaSection } from "./sections/TodayAgenda"
import { UpcomingAppointmentsSection } from "./sections/UpcomingAppointments"
import { InactivePatientsSection } from "./sections/InactivePatients"
import { UpcomingBirthdaysSection } from "./sections/UpcomingBirthdays"

export const DashboardHome = () => {
  const today = useMemo(() => toDateKey(new Date()), [])

  const patientQuery = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    []
  );

  const appointmentsQuery = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sortBy: "date",
      sortOrder: "desc",
    }),
    []
  );

  const todayAppointmentsQuery = useMemo(
    () => ({
      date: today,
      limit: 100,
      sortBy: "date",
      sortOrder: "asc",
    }),
    [today]
  );

  const {
    records: patients,
    pagination: patientPagination,
    isLoading: isLoadingPatients,
  } = useRecords<Patient>("/patients", patientQuery, {
    refetchOnWindowFocus: false,
  });

  const {
    records: todayAppointments,
    isLoading: isLoadingTodayAppointments,
  } = useRecords<Appointment>("/appointments", todayAppointmentsQuery, {
    refetchOnWindowFocus: false,
  });

  const {
    records: appointments,
    isLoading: isLoadingAppointments,
  } = useRecords<Appointment>("/appointments", appointmentsQuery, {
    refetchOnWindowFocus: false,
  });

  const {
    totalPatients,
    newPatients,
    missedAppointments,
    upcomingAppointments,
    inactivePatients,
    upcomingBirthdays,
  } = useMemo(
    () => getDashboardMetrics(patients, appointments, patientPagination?.total),
    [patients, appointments, patientPagination?.total],
  )

  const appointmentTrendData = useMemo(
    () => getAppointmentTrendData(appointments),
    [appointments],
  )

  const isLoadingMetrics =
    isLoadingPatients || isLoadingTodayAppointments || isLoadingAppointments;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold leading-tight">Bem-vindo!</h1>
      </section>

      <QuickActionsSection />

      <MetricsSection
        totalPatients={totalPatients}
        newPatients={newPatients}
        todayAppointmentsCount={todayAppointments.length}
        missedAppointments={missedAppointments}
        isLoading={isLoadingMetrics}
      />

      <AppointmentTrendSection
        isLoading={isLoadingAppointments}
        data={appointmentTrendData}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <TodayAgendaSection
          appointments={todayAppointments}
          isLoading={isLoadingTodayAppointments}
        />
        <UpcomingAppointmentsSection
          appointments={upcomingAppointments}
          isLoading={isLoadingAppointments}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <InactivePatientsSection
          patients={inactivePatients}
          isLoading={isLoadingAppointments}
        />
        <UpcomingBirthdaysSection
          patients={upcomingBirthdays}
          isLoading={isLoadingPatients}
        />
      </section>
    </div>
  )
};
