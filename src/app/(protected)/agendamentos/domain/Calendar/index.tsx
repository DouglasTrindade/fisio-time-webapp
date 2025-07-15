"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate } from "@fullcalendar/core";
import { useAppointments } from "@/app/utils/hooks/useAppointments";
import { AppointmentsModal } from "../Modal";
import { Appointment } from "@/app/utils/types/appointment";

export const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, refetch } = useAppointments();

    const appointments = data?.data || [];

    const handleDateClick = (selectInfo: DateSelectArg) => {
        setSelectedDate(selectInfo);
        setIsDialogOpen(true);
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
        <>
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
                    eventClick={(info: EventClickArg) => {
                        alert(`Agendamento: ${info.event.title}`);
                    }}
                    events={calendarEvents}
                    eventDisplay="block"
                    dayHeaderFormat={{ weekday: "long" }}
                    titleFormat={{ year: "numeric", month: "long" }}
                />
            </div>

            <AppointmentsModal
                open={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    refetch();
                }}
                onDateClick={handleDateClick}
                initialDate={selectedDate?.start.toISOString()}
            />
        </>
    );
};
