"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  type DatesSetArg,
} from "@fullcalendar/core";
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
  const [currentViewTitle, setCurrentViewTitle] = useState("");
  const [currentView, setCurrentView] = useState<CalendarView>("dayGridMonth");
  const calendarRef = useRef<FullCalendar | null>(null);

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
        <span className="fc-event-card__title">{eventInfo.event.title}</span>
        <span className="fc-event-card__time">{timeLabel}</span>
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

  const handleDatesSet = (arg: DatesSetArg) => {
    setCurrentViewTitle(arg.view.title);
  };

  const getCalendarApi = () => calendarRef.current?.getApi() ?? null;

  const handleNavigate = (direction: "prev" | "next") => {
    const api = getCalendarApi();
    if (!api) return;
    direction === "prev" ? api.prev() : api.next();
    setCurrentViewTitle(api.view.title);
  };

  const handleViewChange = (view: CalendarView) => {
    if (view === currentView) return;
    setCurrentView(view);
    const api = getCalendarApi();
    api?.changeView(view);
    if (api) {
      setCurrentViewTitle(api.view.title);
    }
  };

  return (
    <section className="space-y-6 text-white">
      <div className="calendar-shell">
        <div className="flex justify-between">
          <div className="calendar-shell__filters">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleViewChange(option.value)}
                className={option.value === currentView ? "is-active" : undefined}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="calendar-shell__header">
            <div className="calendar-shell__controls">
              <button
                type="button"
                className="calendar-shell__nav-btn"
                onClick={() => handleNavigate("prev")}
                aria-label="Mês anterior"
              >
                ‹
              </button>
              <div className="calendar-shell__title">{currentViewTitle || "Carregando..."}</div>
              <button
                type="button"
                className="calendar-shell__nav-btn"
                onClick={() => handleNavigate("next")}
                aria-label="Próximo mês"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {isCalendarLoading ? (
          <p className="calendar-shell__loading">Carregando agendamentos...</p>
        ) : null}

        <FullCalendar
          ref={calendarRef}
          height="auto"
          contentHeight="auto"
          expandRows
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={false}
          locale="pt-br"
          initialView={currentView}
          firstDay={1}
          navLinks
          stickyHeaderDates
          editable={false}
          selectable={false}
          selectMirror={false}
          dayMaxEvents={true}
          dayMaxEventRows={3}
          nowIndicator
          moreLinkContent={(args) =>
            `+${args.num} ${args.num === 1 ? "horário" : "horários"}`
          }
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
            const weekday = args.date.toLocaleDateString("pt-BR", {
              weekday: "short",
            });
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
          datesSet={handleDatesSet}
        />
      </div>
    </section>
  );
};

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

const viewOptions: { label: string; value: CalendarView }[] = [
  { label: "Mês", value: "dayGridMonth" },
  { label: "Semana", value: "timeGridWeek" },
  { label: "Dia", value: "timeGridDay" },
];
