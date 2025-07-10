"use client";

import { useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventContentArg, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { useAppointmentContext } from '@/contexts/AppointmentContext';
import { useAppointmentsByDateRange } from '@/app/utils/hooks/useAppointments';
import type { CalendarEvent } from '@/app/utils/types/appointment';

export const Calendar = () => {
    const { selectedDate, setSelectedDate, appointments, setAppointments } = useAppointmentContext();

    const currentMonth = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: startOfMonth, end: endOfMonth };
    }, []);

    const { data: monthlyAppointments, isLoading } = useAppointmentsByDateRange(
        currentMonth.start,
        currentMonth.end
    );

    useEffect(() => {
        if (monthlyAppointments) {
            setAppointments(monthlyAppointments);
        }
    }, [monthlyAppointments, setAppointments]);

    const events: CalendarEvent[] = useMemo(() => {
        return appointments.map(appointment => ({
            id: appointment.id,
            title: `${appointment.time} - ${appointment.name}`,
            start: appointment.date,
            allDay: false,
            backgroundColor: appointment.status === 'attended' ? '#10b981' : '#f59e0b',
            borderColor: appointment.status === 'attended' ? '#059669' : '#d97706',
        }));
    }, [appointments]);

    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setSelectedDate(selectInfo.start);
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        const eventDate = clickInfo.event.start;
        if (eventDate) {
            setSelectedDate(eventDate);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="rounded-lg p-4 border">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                weekends={false}
                events={events}
                eventContent={renderEventContent}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="auto"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth'
                }}
                locale="pt-br"
                buttonText={{
                    today: 'Hoje',
                    month: 'Mês',
                }}
                dayHeaderFormat={{ weekday: 'short' }}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                }}
                eventDisplay="block"
                eventBackgroundColor="#f3f4f6"
                eventBorderColor="#d1d5db"
                eventTextColor="#374151"
            />
        </div>
    );
};

const renderEventContent = (eventInfo: EventContentArg) => {
    return (
        <div className="px-1 py-0.5 text-xs truncate">
            <span className="font-medium">{eventInfo.event.title}</span>
        </div>
    );
};