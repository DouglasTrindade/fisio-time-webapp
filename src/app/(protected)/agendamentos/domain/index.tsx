"use client";

import { AppointmentProvider } from "@/contexts/AppointmentContext";
import { Calendar } from "./Calendar";
import { KanbanBoard } from "./Kanban";

export const Appointments = () => {
  return (
    <AppointmentProvider>
      <div className="h-screen">
        <div className="flex flex-col mb-8">
          <span className="text-3xl font-bold">
            Gerenciamento de Agendamentos
          </span>
          <span className="mt-2">
            Selecione uma data no calendário para visualizar os agendamentos
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <KanbanBoard />
          <Calendar />
        </div>
      </div>
    </AppointmentProvider>
  );
};