"use client";

import { useMemo, type ComponentType } from "react";
import { Users, UserPlus, CalendarClock, AlertTriangle, Gift, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecords } from "@/app/utils/hooks/useRecords";
import type { Patient } from "@/app/utils/types/patient";
import type { Appointment } from "@/app/utils/types/appointment";
import { Status } from "@prisma/client";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const NEW_PATIENT_WINDOW_DAYS = 21;
const INACTIVE_THRESHOLD_DAYS = 30;
const BIRTHDAY_WINDOW_DAYS = 14;

const formatTime = (date: string) => {
  const d = new Date(date);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  isLoading?: boolean;
  highlight?: string;
}

const MetricCard = ({
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
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {highlight && !isLoading && (
        <p className="text-xs font-medium mt-2 text-emerald-600">{highlight}</p>
      )}
    </CardContent>
  </Card>
);

export const DashboardHome = () => {
  const today = useMemo(() => {
    const now = new Date();
    const normalized = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );
    return normalized.toISOString().slice(0, 10);
  }, []);

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
  } = useMemo(() => {
    const now = new Date();
    const patientsCreatedWindow = new Date(
      now.getTime() - NEW_PATIENT_WINDOW_DAYS * DAY_IN_MS
    );

    const total = patientPagination?.total ?? patients.length;
    const newOnes = patients.filter((patient) => {
      if (!patient?.createdAt) return false;
      const createdAt = new Date(patient.createdAt);
      return createdAt >= patientsCreatedWindow;
    }).length;

    const sortedUpcoming = appointments
      .filter((appointment) => new Date(appointment.date) >= now)
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .slice(0, 5);

    const noShows = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate < now && appointment.status === Status.waiting
      );
    }).length;

    const lastVisitByPatient = appointments.reduce(
      (acc, appointment) => {
        if (!appointment.patientId) return acc;
        const current = acc.get(appointment.patientId);
        const appointmentDate = new Date(appointment.date);
        if (!current || appointmentDate > current) {
          acc.set(appointment.patientId, appointmentDate);
        }
        return acc;
      },
      new Map<string, Date>()
    );

    const inactive = patients
      .map((patient) => {
        const lastVisit =
          lastVisitByPatient.get(patient.id) ||
          (patient.createdAt ? new Date(patient.createdAt) : null);
        if (!lastVisit) return null;
        const days = Math.floor(
          (now.getTime() - lastVisit.getTime()) / DAY_IN_MS
        );
        if (days < INACTIVE_THRESHOLD_DAYS) return null;
        return {
          id: patient.id,
          name: patient.name || "Paciente sem nome",
          days,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.days ?? 0) - (a!.days ?? 0))
      .slice(0, 4) as { id: string; name: string; days: number }[];

    const birthdays = patients
      .filter((patient) => patient.birthDate)
      .map((patient) => {
        const birthDate = new Date(patient.birthDate!);
        const nextBirthday = new Date(
          now.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );
        if (nextBirthday < now) {
          nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        const diffDays = Math.ceil(
          (nextBirthday.getTime() - now.getTime()) / DAY_IN_MS
        );
        return {
          id: patient.id,
          name: patient.name || "Paciente sem nome",
          nextBirthday,
          diffDays,
        };
      })
      .filter((patient) => patient.diffDays <= BIRTHDAY_WINDOW_DAYS)
      .sort((a, b) => a.diffDays - b.diffDays)
      .slice(0, 4);

    return {
      totalPatients: total,
      newPatients: newOnes,
      missedAppointments: noShows,
      upcomingAppointments: sortedUpcoming,
      inactivePatients: inactive,
      upcomingBirthdays: birthdays,
    };
  }, [patients, appointments, patientPagination]);

  const isLoadingMetrics =
    isLoadingPatients || isLoadingTodayAppointments || isLoadingAppointments;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold leading-tight">
          Bem-vindo!
        </h1>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total de pacientes"
          value={totalPatients}
          description="Pacientes ativos na base"
          icon={Users}
          isLoading={isLoadingMetrics}
        />
        <MetricCard
          title="Novos nas últimas semanas"
          value={newPatients}
          description={`Janela de ${NEW_PATIENT_WINDOW_DAYS} dias`}
          icon={UserPlus}
          isLoading={isLoadingMetrics}
        />
        <MetricCard
          title="Agendamentos de hoje"
          value={todayAppointments.length}
          description="Inclui todos os profissionais"
          icon={CalendarClock}
          isLoading={isLoadingMetrics}
        />
        <MetricCard
          title="Agendamentos perdidos"
          value={missedAppointments}
          description="Marcados como no-show"
          icon={AlertTriangle}
          isLoading={isLoadingMetrics}
          highlight={
            missedAppointments === 0
              ? "Excelente aproveitamento!"
              : undefined
          }
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Agenda de hoje</CardTitle>
              <p className="text-sm text-muted-foreground">
                {todayAppointments.length} compromisso
                {todayAppointments.length === 1 ? "" : "s"} agendado
              </p>
            </div>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingTodayAppointments ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full" />
                ))}
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Nenhum agendamento para hoje.
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{appointment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatTime(appointment.date)}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${appointment.status === Status.confirmed
                          ? "bg-emerald-100 text-emerald-800"
                          : appointment.status === Status.canceled
                            ? "bg-rose-100 text-rose-800"
                            : appointment.status === Status.rescheduled
                              ? "bg-amber-100 text-amber-800"
                              : "bg-sky-100 text-sky-800"
                          }`}
                      >
                        {appointment.status === Status.confirmed
                          ? "Confirmado"
                          : appointment.status === Status.canceled
                            ? "Cancelado"
                            : appointment.status === Status.rescheduled
                              ? "Reagendado"
                              : "Aguardando"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos agendamentos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visão rápida dos próximos dias
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum compromisso futuro encontrado.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{appointment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        às {formatTime(appointment.date)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatDate(new Date(appointment.date))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alertas de retorno</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pacientes sem retorno há mais de {INACTIVE_THRESHOLD_DAYS} dias
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-10 w-full" />
                ))}
              </div>
            ) : inactivePatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum paciente em atraso. Continue assim!
              </p>
            ) : (
              <div className="space-y-4">
                {inactivePatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.days} dias sem retorno
                      </p>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aniversários próximos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pacientes com aniversário nos próximos {BIRTHDAY_WINDOW_DAYS} dias
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingPatients ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-10 w-full" />
                ))}
              </div>
            ) : upcomingBirthdays.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum aniversário no radar.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingBirthdays.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(patient.nextBirthday)} · em{" "}
                        {patient.diffDays} dia
                        {patient.diffDays === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Gift className="h-4 w-4 text-pink-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
