import { differenceInDays, format, parseISO, startOfDay } from "date-fns";

import { AgendaAppointmentCard } from "@/app/(protected)/agendamentos/_components/Calendar/components/agenda-view/agenda-appointment-card";
import { appDateLocale } from "@/lib/date-locale";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  date: Date;
  appointments: IAppointment[];
  multiDayAppointments: IAppointment[];
}

export function AgendaDayGroup({ date, appointments, multiDayAppointments }: IProps) {
  const sortedAppointments = [...appointments].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="space-y-4">
      <div className="sticky top-0 flex items-center gap-4 bg-background py-2">
        <p className="text-sm font-semibold">
          {(() => {
            const label = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: appDateLocale });
            return label.charAt(0).toUpperCase() + label.slice(1);
          })()}
        </p>
      </div>

      <div className="space-y-2">
        {multiDayAppointments.length > 0 &&
          multiDayAppointments.map(appointment => {
            const appointmentStart = startOfDay(parseISO(appointment.startDate));
            const appointmentEnd = startOfDay(parseISO(appointment.endDate));
            const currentDate = startOfDay(date);

            const appointmentTotalDays = differenceInDays(appointmentEnd, appointmentStart) + 1;
            const appointmentCurrentDay = differenceInDays(currentDate, appointmentStart) + 1;
            return <AgendaAppointmentCard key={appointment.id} appointment={appointment} appointmentCurrentDay={appointmentCurrentDay} appointmentTotalDays={appointmentTotalDays} />;
          })}

        {sortedAppointments.length > 0 && sortedAppointments.map(appointment => <AgendaAppointmentCard key={appointment.id} appointment={appointment} />)}
      </div>
    </div>
  );
}
