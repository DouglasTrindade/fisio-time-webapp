"use client";

import FullCalendar from "@fullcalendar/react";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAppointmentsContext } from "@/contexts/AppointmentsContext";
import type { Appointment } from "@/app/types/appointment";
import { Status } from "@prisma/client";

interface CalendarProps {
    onDateSelect: (date: Date) => void;
}

export const Calendar = ({ onDateSelect }: CalendarProps) => {
    const { calendarAppointments: appointments, isCalendarLoading } = useAppointmentsContext();

    const handleDateClick = (selectInfo: DateSelectArg) => {
        onDateSelect(selectInfo.start);
    };

    const handleEventClick = (info: EventClickArg) => {
        const appointment = info.event.extendedProps as Appointment;
        console.log("Evento clicado:", appointment);
    };

    const handleDayClick = (arg: { date: Date }) => {
        onDateSelect(arg.date);
    };

    const calendarEvents = appointments.map((appt) => ({
        id: appt.id,
        title: appt.name,
        start: appt.date,
        backgroundColor:
            appt.status === Status.CONFIRMED
                ? "#10b981"
                : appt.status === Status.CANCELED
                    ? "#ef4444"
                    : appt.status === Status.RESCHEDULED
                        ? "#facc15"
                        : appt.status === Status.WAITING
                            ? "#3b82f6"
                            : "#6b7280",
        extendedProps: { ...appt },
    }));

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
                editable={false}
                selectable={false}
                selectMirror={false}
                dayMaxEvents={true}
                dateClick={handleDayClick}
                select={handleDateClick}
                eventClick={handleEventClick}
                events={calendarEvents}
                eventDisplay="block"
                dayHeaderFormat={{ weekday: "long" }}
                titleFormat={{ year: "numeric", month: "long" }}
            />
        </div>
    );
};
