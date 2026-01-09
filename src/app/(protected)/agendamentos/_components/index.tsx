"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { Calendar } from "./Calendar";
import { AppointmentsModal } from "./Modal";
import { useAppointmentsContext } from "@/contexts/AppointmentsContext";
import type { Appointment } from "@/app/types/appointment";
import { Status } from "@prisma/client";

const statusFilters: {
  label: string;
  value: Status | "all";
  className: string;
}[] = [
    {
      label: "Todos",
      value: "all",
      className: "bg-violet-600/20 text-violet-200",
    },
    {
      label: "Confirmados",
      value: Status.CONFIRMED,
      className: "bg-emerald-600/15 text-emerald-200",
    },
    {
      label: "Aguardando",
      value: Status.WAITING,
      className: "bg-sky-600/15 text-sky-200",
    },
    {
      label: "Remarcados",
      value: Status.RESCHEDULED,
      className: "bg-amber-500/15 text-amber-100",
    },
    {
      label: "Cancelados",
      value: Status.CANCELED,
      className: "bg-rose-500/15 text-rose-100",
    },
  ];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatEventDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

const formatEventTime = (date: Date) =>
  date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const Appointments = () => {
  const {
    records: appointments,
    isFetching,
    selectedDate,
    isDialogOpen,
    editingAppointment,
    handleDateSelect,
    openNew,
    openEdit,
    closeDialog,
  } = useAppointmentsContext();
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  if (process.env.NODE_ENV !== "production") {
    console.debug("[Appointments] selectedDate=", selectedDate?.toISOString(), "records=", appointments.length, appointments[0]);
  }


  const totalAppointments = appointments.length;

  const highlightedAppointments = useMemo(() => {
    const today = new Date();
    const baseList = selectedDate
      ? appointments.filter((appointment) =>
        isSameDay(new Date(appointment.date), selectedDate),
      )
      : appointments.filter((appointment) => new Date(appointment.date) >= today);

    const filteredByStatus =
      statusFilter === "all"
        ? baseList
        : baseList.filter((appointment) => appointment.status === statusFilter);

    return filteredByStatus
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
      .slice(0, 6);
  }, [appointments, selectedDate, statusFilter]);

  const groupedAppointments = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        date: Date;
        dayNumber: string;
        weekday: string;
        appointments: Appointment[];
      }
    >();

    highlightedAppointments.forEach((appointment) => {
      const date = new Date(appointment.date);
      const key = date.toISOString().slice(0, 10);
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          date,
          dayNumber: date.getDate().toString().padStart(2, "0"),
          weekday: date
            .toLocaleDateString("pt-BR", { weekday: "short" })
            .toUpperCase(),
          appointments: [],
        });
      }
      groups.get(key)!.appointments.push(appointment);
    });

    return Array.from(groups.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [highlightedAppointments]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            {totalAppointments} paciente{totalAppointments !== 1 ? "s" : ""} agendado{totalAppointments !== 1 ? "s" : ""}
          </p>
        </div>

        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Calendar onDateSelect={handleDateSelect} />

      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
              Próximos agendamentos
            </p>
            <h2 className="text-2xl font-semibold">
              {selectedDate
                ? `Agenda de ${selectedDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}`
                : "Eventos futuros"}
            </h2>
            <p className="text-muted-foreground">
              {highlightedAppointments.length} resultado
              {highlightedAppointments.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 rounded-full bg-muted/20 p-1">
            {statusFilters.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${statusFilter === option.value
                  ? `${option.className} shadow-lg`
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {groupedAppointments.length > 0 ? (
            groupedAppointments.map((group) => (
              <UpcomingGroup
                key={group.key}
                group={group}
                onEdit={openEdit}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-white/5 bg-muted/5 p-10 text-center text-muted-foreground">
              {isFetching
                ? "Carregando agendamentos..."
                : "Nenhum agendamento encontrado para os filtros selecionados."}
            </div>
          )}
        </div>
      </section>

      <AppointmentsModal
        open={isDialogOpen}
        onClose={() => {
          closeDialog();
        }}
        initialDate={(selectedDate && !editingAppointment)
          ? (() => {
            const d = new Date(selectedDate);
            d.setHours(9, 0, 0, 0); // 09:00
            return d.toISOString();
          })()
          : selectedDate?.toISOString()}
        appointment={editingAppointment}
      />
    </div>
  );
};

const statusAccentMap: Record<Status, string> = {
  [Status.CONFIRMED]: "from-emerald-400 to-emerald-500",
  [Status.WAITING]: "from-sky-400 to-sky-500",
  [Status.RESCHEDULED]: "from-amber-300 to-amber-500",
  [Status.CANCELED]: "from-rose-400 to-rose-500",
};

const UpcomingGroup = ({
  group,
  onEdit,
}: {
  group: {
    key: string;
    date: Date;
    dayNumber: string;
    weekday: string;
    appointments: Appointment[];
  };
  onEdit: (appointment: Appointment) => void;
}) => {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/5 bg-[#07070d] p-4 shadow-[0_35px_70px_-60px_rgba(0,0,0,0.95)] transition hover:border-white/10">
      {group.appointments.map((appointment) => (
        <UpcomingAppointmentItem
          key={appointment.id}
          appointment={appointment}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

const UpcomingAppointmentItem = ({
  appointment,
  onEdit,
}: {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
}) => {
  const date = new Date(appointment.date);
  const accentClass = statusAccentMap[appointment.status] ?? "from-white/30 to-white/10";

  return (
    <button
      type="button"
      onClick={() => onEdit(appointment)}
      className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-[#10101a] p-4 text-left transition hover:border-white/20 hover:bg-[#151524]"
    >
      <span
        className={`inline-flex h-12 w-1.5 rounded-full bg-linear-to-b ${accentClass}`}
      />
      <div className="flex flex-1 flex-col gap-1 text-white">
        <p className="text-base font-semibold">
          {appointment.name || "Paciente sem nome"}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatEventTime(date)}
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatEventDate(date)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {appointment.notes || "Sem observações adicionais."}
        </p>
      </div>
    </button>
  );
};
