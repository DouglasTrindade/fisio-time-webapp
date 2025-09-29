"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AppointmentCard } from "./Card";
import { Calendar } from "./Calendar";
import { AppointmentsModal } from "./Modal";
import { useAppointments } from "@/app/utils/hooks/useAppointments";
import { Appointment } from "@/app/utils/types/appointment";

export const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);

  const { data, refetch } = useAppointments();
  const appointments = data?.data || [];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);

    const filtered = appointments.filter((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === date.toDateString();
    });

    setFilteredAppointments(filtered);
  };

  const handleNewAppointment = () => {
    setIsDialogOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    console.log("Editar agendamento:", appointment);
  };

  const handleDeleteAppointment = (id: string) => {
    console.log("Excluir agendamento:", id);
  };

  const totalAppointments = appointments.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            {totalAppointments} pacientes Agendados
          </p>
        </div>

        <Button onClick={handleNewAppointment}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="flex w-full gap-6">
        <div className="flex-1">
          <Calendar onDateSelect={handleDateSelect} />
        </div>

        <div className="w-80">
          {selectedDate && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold">
                  Agendamentos - {selectedDate.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filteredAppointments.length} agendamento{filteredAppointments.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={handleEditAppointment}
                      onDelete={handleDeleteAppointment}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum agendamento encontrado para esta data</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedDate && (
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
          refetch();
        }}
        initialDate={undefined}
      />
    </div>
  );
}