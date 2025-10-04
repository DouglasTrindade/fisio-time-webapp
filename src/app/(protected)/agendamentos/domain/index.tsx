"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AppointmentCard } from "./Card";
import { Calendar } from "./Calendar";
import { AppointmentsModal } from "./Modal";
import { useRecords } from "@/app/utils/hooks/useRecords";
import { Appointment } from "@/app/utils/types/appointment";
import { DateTime } from "luxon";

export const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const queryDate = selectedDate
    ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10)
    : undefined; // YYYY-MM-DD
  const { records: appointments, refetch, isFetching } = useRecords<Appointment>(
    "/appointments",
    queryDate ? { date: queryDate } : undefined
  );

  if (process.env.NODE_ENV !== "production") {
    console.debug("[Appointments] selectedDate=", selectedDate?.toISOString(), "queryDate=", queryDate, "records=", appointments.length, appointments[0]);
  }

  const handleDateSelect = (date: Date) => {
    // Agora apenas filtra pela data; não abre modal automaticamente
    setSelectedDate(date);
    setEditingAppointment(null);
    // Garantir que modal permaneça fechado
    setIsDialogOpen(false);
  };

  const handleNewAppointment = () => {
    setSelectedDate(null);
    setEditingAppointment(null);
    setIsDialogOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setSelectedDate(new Date(appointment.date));
    setIsDialogOpen(true);
  };


  const filteredAppointments = appointments; // já filtrados no backend se date presente
  const totalAppointments = appointments.length; // total do resultado atual (paginado)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            {totalAppointments} paciente{totalAppointments !== 1 ? "s" : ""} agendado{totalAppointments !== 1 ? "s" : ""}
          </p>
        </div>

        <Button onClick={handleNewAppointment}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="flex w-full gap-6">
        <div className="flex-1">
          <Calendar
            onDateSelect={handleDateSelect}
            onEventClick={handleEditAppointment}
          />
        </div>

        <div className="w-80">
          {selectedDate ? (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold">
                  Agendamentos -{" "}
                  {selectedDate.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filteredAppointments.length} agendamento
                  {filteredAppointments.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={handleEditAppointment}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{isFetching ? "Carregando..." : "Nenhum agendamento encontrado para esta data"}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Selecione uma data no calendário para ver os agendamentos</p>
            </div>
          )}
        </div>
      </div>

      <AppointmentsModal
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingAppointment(null);
          refetch();
        }}
        initialDate={(selectedDate && !editingAppointment)
          ? (() => {
              const d = new Date(selectedDate);
              d.setHours(9,0,0,0); // 09:00
              return d.toISOString();
            })()
          : selectedDate?.toISOString()}
        appointment={editingAppointment}
      />
    </div>
  );
};
