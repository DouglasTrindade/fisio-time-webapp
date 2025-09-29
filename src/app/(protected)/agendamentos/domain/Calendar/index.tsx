"use client";

import FullCalendar from "@fullcalendar/react";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAppointments } from "@/app/utils/hooks/useAppointments";
import { Appointment } from "@/app/utils/types/appointment";

interface CalendarProps {
    onDateSelect: (date: Date) => void;
}

export const Calendar = ({ onDateSelect }: CalendarProps) => {
    const { data } = useAppointments();
    const appointments = data?.data || [];

    const handleDateClick = (selectInfo: DateSelectArg) => {
        onDateSelect(selectInfo.start);
    };

    const handleEventClick = (info: EventClickArg) => {
        const appointment = info.event.extendedProps as Appointment;
        alert(`Agendamento: ${info.event.title}\nHorário: ${new Date(appointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
    };

    const calendarEvents = appointments.map((appt: Appointment) => ({
        id: appt.id,
        title: appt.name,
        start: appt.date,
        backgroundColor:
            appt.status === "confirmed"
                ? "#10b981"
                : appt.status === "canceled"
                    ? "#ef4444"
                    : appt.status === "rescheduled"
                        ? "#facc15"
                        : appt.status === "waiting"
                            ? "#3b82f6"
                            : "#6b7280",
        extendedProps: {
            ...appt,
        },
    }));

    return (
        <div className="w-full">
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
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
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