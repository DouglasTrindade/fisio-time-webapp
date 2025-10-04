"use client";

import FullCalendar from "@fullcalendar/react";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRecords } from "@/app/utils/hooks/useRecords";
import { Appointment } from "@/app/utils/types/appointment";

interface CalendarProps {
    onDateSelect: (date: Date) => void;
    onEventClick: (appointment: Appointment) => void; // 🔹 dispara edição
}

export const Calendar = ({ onDateSelect, onEventClick }: CalendarProps) => {
    const { records: appointments, isLoading } = useRecords<Appointment>("/appointments");

    /** 🔹 Quando o usuário seleciona um dia no calendário */
    const handleDateClick = (selectInfo: DateSelectArg) => {
        onDateSelect(selectInfo.start);
    };

    /** 🔹 Quando o usuário clica em um evento */
    const handleEventClick = (info: EventClickArg) => {
        const appointment = info.event.extendedProps as Appointment;
        onEventClick(appointment); // dispara modal de edição
    };

    /** 🔹 Quando o usuário clica em um dia (apenas filtra, não abre modal) */
    const handleDayClick = (arg: { date: Date }) => {
        onDateSelect(arg.date);
    };

    /** 🔹 Mapeia agendamentos para eventos do FullCalendar */
    const calendarEvents = appointments.map((appt) => ({
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
        extendedProps: { ...appt },
    }));

    return (
        <div className="w-full">
            {isLoading && (
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
                eventClick={handleEventClick}
                events={calendarEvents}
                eventDisplay="block"
                dayHeaderFormat={{ weekday: "long" }}
                titleFormat={{ year: "numeric", month: "long" }}
            />
        </div>
    );
};
