"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AppointmentCard } from "./Card";

export const Appointments = () => {

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            0 pacientes cadastrados
          </p>
        </div>

        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div>
        <AppointmentCard name="Douglas Trindade" date="11/07" phone="(84) 99624-2338" />
      </div>
    </div>
  );
}
