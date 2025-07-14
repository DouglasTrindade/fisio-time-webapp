"use client";

import React, { useState, useEffect } from "react";
import {
    formatDate,
    DateSelectArg,
    EventClickArg,
    EventApi,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export const Calendar: React.FC = () => {
    const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [newEventTitle, setNewEventTitle] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedEvents = localStorage.getItem("events");
            if (savedEvents) {
                setCurrentEvents(JSON.parse(savedEvents));
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("events", JSON.stringify(currentEvents));
        }
    }, [currentEvents]);

    const handleDateClick = (selected: DateSelectArg) => {
        setSelectedDate(selected);
        setIsDialogOpen(true);
    };

    const handleEventClick = (selected: EventClickArg) => {
        if (
            window.confirm(
                `Are you sure you want to delete the event "${selected.event.title}"?`
            )
        ) {
            selected.event.remove();
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setNewEventTitle("");
    };

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEventTitle && selectedDate) {
            const calendarApi = selectedDate.view.calendar;
            calendarApi.unselect();

            const newEvent = {
                id: `${selectedDate.start.toISOString()}-${newEventTitle}`,
                title: newEventTitle,
                start: selectedDate.start,
                end: selectedDate.end,
                allDay: selectedDate.allDay,
            };

            calendarApi.addEvent(newEvent);
            handleCloseDialog();
        }
    };
    const appointments: any = []

    const calendarEvents = appointments.map((appointment: any) => ({
        id: appointment.id,
        title: appointment.title,
        start: new Date(appointment.date.getFullYear(), appointment.date.getMonth(), appointment.date.getDate()),
        backgroundColor: appointment.status === 'agendado' ? '#3b82f6' :
            appointment.status === 'confirmado' ? '#10b981' :
                appointment.status === 'cancelado' ? '#ef4444' : '#6b7280',
        extendedProps: {
            appointment: appointment
        }
    }));

    return (
        <div>
            <div className="flex w-full px-10 justify-start items-start gap-8">
                <div className="w-3/12">
                    <div className="py-10 text-2xl font-extrabold px-7">
                        Calendar Events
                    </div>
                    <ul className="space-y-4">
                        {currentEvents.length <= 0 && (
                            <div className="italic text-center text-gray-400">
                                No Events Present
                            </div>
                        )}

                        {currentEvents.length > 0 &&
                            currentEvents.map((event: EventApi) => (
                                <li
                                    className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                                    key={event.id}
                                >
                                    {event.title}
                                    <br />
                                    <label className="text-slate-950">
                                        {formatDate(event.start!, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}{" "}
                                        {/* Format event start date */}
                                    </label>
                                </li>
                            ))}
                    </ul>
                </div>

                <div className="w-9/12 mt-8">
                    <FullCalendar
                        height="75vh"
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        buttonText={{
                            today: 'Hoje',
                            month: 'Mês',
                            week: 'Semana',
                            day: 'Dia'
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
                        dayHeaderFormat={{ weekday: 'long' }}
                        titleFormat={{ year: 'numeric', month: 'long' }}
                    />
                </div>
            </div>
        </div>
    );
};
