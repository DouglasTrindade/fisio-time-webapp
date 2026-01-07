"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { DateSelectArg, EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAppointmentsContext } from "@/contexts/AppointmentsContext";
import type { Appointment } from "@/app/types/appointment";
import { Status } from "@prisma/client";
import "./calendar.css";

interface CalendarProps {
    onDateSelect: (date: Date) => void;
}

const statusClassMap: Record<Status, string> = {
    [Status.CONFIRMED]: "status-confirmed",
    [Status.CANCELED]: "status-canceled",
    [Status.RESCHEDULED]: "status-rescheduled",
    [Status.WAITING]: "status-waiting",
};

export const Calendar = ({ onDateSelect }: CalendarProps) => {
  const { calendarAppointments: appointments, isCalendarLoading } = useAppointmentsContext();
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);

  const handleDateClick = (selectInfo: DateSelectArg) => {
      setSelectedDateISO(selectInfo.startStr.slice(0, 10));
      onDateSelect(selectInfo.start);
  };

    const handleEventClick = (info: EventClickArg) => {
        const appointment = info.event.extendedProps as Appointment;
        console.log("Evento clicado:", appointment);
  };

  const handleDayClick = (arg: { date: Date }) => {
      setSelectedDateISO(arg.date.toISOString().slice(0, 10));
      onDateSelect(arg.date);
  };

  const calendarEvents = appointments.map((appt) => ({
    id: appt.id,
    title: appt.name,
    start: appt.date,
    classNames: [statusClassMap[appt.status] ?? "status-default"],
    extendedProps: { ...appt },
  }));

  const renderEventContent = (eventInfo: EventContentArg) => {
    const appointment = eventInfo.event.extendedProps as Appointment;
    const startDate = eventInfo.event.start ?? new Date(eventInfo.event.startStr);
    const timeLabel = startDate
      ? new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(startDate)
      : eventInfo.timeText;

    return (
      <div className="fc-event-card">
        <span className="fc-event-card__time">{timeLabel}</span>
        <span className="fc-event-card__title">{eventInfo.event.title}</span>
        {appointment.phone ? (
          <span className="fc-event-card__meta">{appointment.phone}</span>
        ) : null}
      </div>
    );
  };

  const dayCellClassNames = (arg: { date: Date }) => {
    if (!selectedDateISO) return [];
    const cellDateISO = arg.date.toISOString().slice(0, 10);
    return cellDateISO === selectedDateISO ? ["fc-day-selected"] : [];
  };

  return (
        <div className="w-full">
            {isCalendarLoading && (
                <div className="text-sm text-muted-foreground mb-2">Carregando agendamentos...</div>
            )}
            <FullCalendar
                height="75vh"
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                buttonText={{
                    today: "Hoje",
                    month: "Mês",
                    week: "Semana",
                    day: "Dia",
                }}
                locale="pt-br"
                initialView="dayGridMonth"
                firstDay={1}
                navLinks
                stickyHeaderDates
                editable={false}
                selectable={false}
                selectMirror={false}
                dayMaxEvents={true}
                dayMaxEventRows={3}
                nowIndicator
                moreLinkContent={(args) => `+${args.num} ${args.num === 1 ? "horário" : "horários"}`}
                dateClick={handleDayClick}
                select={handleDateClick}
                eventClick={handleEventClick}
                events={calendarEvents}
                eventDisplay="block"
                eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }}
                slotLabelFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }}
                dayHeaderContent={(args) => {
                    const weekday = args.date.toLocaleDateString("pt-BR", { weekday: "short" });
                    const dayNumber = args.date.getDate().toString().padStart(2, "0");
                    return (
                        <div className="fc-day-header">
                            <span className="fc-day-header__weekday">{weekday}</span>
                            <span className="fc-day-header__day">{dayNumber}</span>
                        </div>
                    );
                }}
                dayHeaderFormat={{ weekday: "long" }}
                titleFormat={{ year: "numeric", month: "long" }}
                eventContent={renderEventContent}
                moreLinkClassNames="fc-more-link-modern"
              businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5],
                  startTime: "08:00",
                  endTime: "19:00",
              }}
              dayCellClassNames={dayCellClassNames}
          />
        </div>
    );
};
