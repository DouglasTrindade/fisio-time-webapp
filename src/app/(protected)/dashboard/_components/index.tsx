"use client";

import Link from "next/link";
import { useMemo, type ComponentType } from "react";
import {
  Users,
  UserPlus,
  CalendarClock,
  AlertTriangle,
  Gift,
  Bell,
  CalendarRange,
  UsersRound,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRecords } from "@/hooks/useRecords";
import type { Patient } from "@/types/patient";
import type { Appointment } from "@/types/appointment";
import { Status } from "@prisma/client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const NEW_PATIENT_WINDOW_DAYS = 21;
const INACTIVE_THRESHOLD_DAYS = 30;
const BIRTHDAY_WINDOW_DAYS = 14;

const toDateKey = (date: Date) => {
  const normalized = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return normalized.toISOString().slice(0, 10);
};

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

const QUICK_ACTIONS = [
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
] as const;

const APPOINTMENT_TREND_CHART_CONFIG = {
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
} satisfies ChartConfig;

const STATUS_STYLE: Record<
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
};

const QuickActionCard = ({ action }: { action: (typeof QUICK_ACTIONS)[number] }) => {
  const { title, description, badge, href, icon: Icon } = action;
  return (
    <Link
      href={href}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
    >
      <Card className="rounded-2xl border-border/60 bg-card/80 transition hover:border-primary/60 hover:shadow-md h-full">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {badge}
          </span>
        </CardHeader>
      </Card>
    </Link>
  );
};

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
  const today = useMemo(() => toDateKey(new Date()), []);

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
        appointmentDate < now && appointment.status === Status.WAITING
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

  const appointmentTrendData = useMemo(() => {
    const grouped = appointments.reduce<Record<string, Appointment[]>>((acc, appointment) => {
      const key = toDateKey(new Date(appointment.date));
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(appointment);
      return acc;
    }, {});
    const reference = new Date();
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(reference);
      day.setDate(reference.getDate() - (6 - index));
      const key = toDateKey(day);
      const dayAppointments = grouped[key] ?? [];
      const scheduled = dayAppointments.length;
      const confirmed = dayAppointments.filter((item) => item.status === Status.CONFIRMED).length;
      const canceled = dayAppointments.filter((item) => item.status === Status.CANCELED).length;

      return {
        key,
        label: day.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        scheduled,
        confirmed,
        canceled,
      };
    });
  }, [appointments]);

  const hasAppointmentTrendData = appointmentTrendData.some((entry) => entry.scheduled > 0);

  const isLoadingMetrics =
    isLoadingPatients || isLoadingTodayAppointments || isLoadingAppointments;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold leading-tight">
          Bem-vindo!
        </h1>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Acesso rápido
          </p>
          <p className="text-sm text-muted-foreground">
            Principais módulos para o fluxo diário da clínica
          </p>
        </div>
        <div className="md:hidden">
          <ScrollArea className="-mx-4">
            <div className="flex gap-4 px-4 py-1">
              {QUICK_ACTIONS.map((action) => (
                <div key={action.title} className="min-w-[240px] flex-1">
                  <QuickActionCard action={action} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.title} action={action} />
          ))}
        </div>
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

      <section>
        <Card className="border-border/70 bg-card/85 shadow-sm">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Tendência de atendimentos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comparativo dos últimos 7 dias por status
              </p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/relatorios/atendimentos/profissionais">Ver relatórios</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingAppointments ? (
              <Skeleton className="h-[280px] w-full" />
            ) : hasAppointmentTrendData ? (
              <ChartContainer config={APPOINTMENT_TREND_CHART_CONFIG} className="h-[280px] w-full">
                <AreaChart data={appointmentTrendData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={12} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          `${value as number} atend.`,
                          APPOINTMENT_TREND_CHART_CONFIG[name as keyof typeof APPOINTMENT_TREND_CHART_CONFIG]?.label ??
                            name,
                        ]}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent className="pt-4" />} />
                  <Area
                    type="monotone"
                    dataKey="confirmed"
                    stroke="var(--color-confirmed)"
                    fill="var(--color-confirmed)"
                    fillOpacity={0.25}
                    strokeWidth={3}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="scheduled"
                    stroke="var(--color-scheduled)"
                    fill="var(--color-scheduled)"
                    fillOpacity={0.12}
                    strokeDasharray="6 4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="canceled"
                    stroke="var(--color-canceled)"
                    fill="var(--color-canceled)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
                Ainda não há dados suficientes para exibir o gráfico.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Agenda de hoje
                <Badge variant="secondary" className="text-xs font-medium">
                  {todayAppointments.length} compromisso
                  {todayAppointments.length === 1 ? "" : "s"}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Inclui todos os profissionais conectados
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/agendamentos">
                <Bell className="mr-2 h-4 w-4" />
                Ver agenda completa
              </Link>
            </Button>
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
                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold">
                        {formatTime(appointment.date)}
                      </p>
                      <Badge
                        className={`text-xs ${STATUS_STYLE[appointment.status]?.badgeClass ?? "bg-muted text-foreground"}`}
                      >
                        {STATUS_STYLE[appointment.status]?.label ?? "Status"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Próximos agendamentos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visão rápida dos próximos dias
              </p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/agendamentos" className="text-primary">
                Ver calendário
              </Link>
            </Button>
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(appointment.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}{" "}
                          às {formatTime(appointment.date)}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {STATUS_STYLE[appointment.status]?.label ?? "Status"}
                        </Badge>
                      </div>
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
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Alertas de retorno</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pacientes sem retorno há mais de {INACTIVE_THRESHOLD_DAYS} dias
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/pacientes">Ver pacientes</Link>
            </Button>
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
                        Último contato há {patient.days} dia
                        {patient.days === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 text-[11px]">
                      {patient.days} dias
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Aniversários próximos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pacientes com aniversário nos próximos {BIRTHDAY_WINDOW_DAYS} dias
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/pacientes">Enviar felicitação</Link>
            </Button>
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
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {formatDate(patient.nextBirthday)} · em {patient.diffDays} dia
                        {patient.diffDays === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Badge className="bg-pink-100 text-pink-700 text-[11px]">
                      <Gift className="mr-1 h-3 w-3" />
                      {patient.diffDays}d
                    </Badge>
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
