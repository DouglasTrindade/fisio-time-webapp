"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AppointmentCard } from "./Card";
import { Calendar } from "./Calendar";
import { AppointmentsModal } from "./Modal";
import { useAppointmentsContext } from "@/context/AppointmentsContext";

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

  if (process.env.NODE_ENV !== "production") {
    console.debug("[Appointments] selectedDate=", selectedDate?.toISOString(), "records=", appointments.length, appointments[0]);
  }


  const filteredAppointments = appointments;
  const totalAppointments = appointments.length;

  return (
    <div className="space-y-4">
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

      <div className="flex w-full gap-6">
        <div className="flex-1">
          <Calendar
            onDateSelect={handleDateSelect}
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

              <div className="space-y-3 h-[38rem] overflow-y-auto">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={openEdit}
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
