"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { appDateLocale } from "@/lib/date-locale";
import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";
import { useRecord } from "@/hooks/useRecord";
import type { Appointment } from "@/types/appointment";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  appointment: IAppointment;
  children: React.ReactNode;
}

export function AppointmentDetailsDialog({ appointment, children }: IProps) {
  const { editAppointment } = useCalendar();
  const [open, setOpen] = useState(false);

  const appointmentId = open ? appointment.id : undefined;
  const { data: appointmentDetails } = useRecord<Appointment>("/appointments", appointmentId, {
    enabled: open,
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
    editAppointment(appointment);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>

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
      </Dialog>
    </>
  );
}
