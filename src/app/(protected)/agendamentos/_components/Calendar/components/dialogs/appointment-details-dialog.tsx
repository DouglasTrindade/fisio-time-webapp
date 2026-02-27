"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { appDateLocale } from "@/lib/date-locale";
import { useRecord } from "@/hooks/useRecord";
import type { Appointment } from "@/types/appointment";
import { useAppointmentsContext } from "@/contexts/AppointmentsContext";
import { useModalContext } from "@/contexts/ModalContext";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  appointment: IAppointment;
  children: React.ReactNode;
}

interface AppointmentDetailsContentProps {
  appointment: IAppointment;
  onHide?: () => void;
}

function AppointmentDetailsContent({ appointment, onHide }: AppointmentDetailsContentProps) {
  const { records: appointmentRecords, openEdit } = useAppointmentsContext();

  const { data: appointmentDetails } = useRecord<Appointment>("/appointments", appointment.id, {
    enabled: true,
    staleTime: 30_000,
  });

  const startDate = useMemo(
    () => parseISO(appointmentDetails?.date ?? appointment.startDate),
    [appointmentDetails?.date, appointment.startDate],
  );
  const endDate = useMemo(
    () => {
      const source = appointmentDetails?.date
        ? appointmentDetails.date
        : appointment.endDate;
      return parseISO(source);
    },
    [appointmentDetails?.date, appointment.endDate],
  );

  const professionalName = appointmentDetails?.professional?.name ?? appointment.user.name;
  const description = appointmentDetails?.notes ?? appointment.description;

  const handleEdit = () => {
    const target = appointmentRecords.find((record) => record.id === appointment.id);
    if (target) {
      openEdit(target);
    }
    onHide?.();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{appointment.title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <User className="mt-1 size-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Responsável</p>
            <p className="text-sm text-muted-foreground">{professionalName || "Não informado"}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar className="mt-1 size-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Início</p>
            <p className="text-sm text-muted-foreground">{format(startDate, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: appDateLocale })}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="mt-1 size-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Término</p>
            <p className="text-sm text-muted-foreground">{format(endDate, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: appDateLocale })}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Text className="mt-1 size-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Descrição</p>
            <p className="text-sm text-muted-foreground">{description || "Sem observações."}</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={handleEdit}>
          Editar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function AppointmentDetailsDialog({ appointment, children }: IProps) {
  const { openModal } = useModalContext();

  const handleOpen = () => {
    openModal(
      {
        modal: AppointmentDetailsContent,
      },
      { appointment }
    );
  };

  return (
    <div
      className="contents"
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
