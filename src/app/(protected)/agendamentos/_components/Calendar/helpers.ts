import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
  isSameWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  differenceInMinutes,
  eachDayOfInterval,
  startOfDay,
  differenceInDays,
  endOfYear,
  startOfYear,
  subYears,
  addYears,
  isSameYear,
  isWithinInterval,
} from "date-fns";

import type { ICalendarCell, IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";
import type { TCalendarView, TVisibleHours, TWorkingHours } from "@/app/(protected)/agendamentos/_components/Calendar/types";
import { appDateLocale } from "@/lib/date-locale";

// ================ Header helper functions ================ //

export function rangeText(view: TCalendarView, date: Date) {
  const formatString = "d 'de' MMM 'de' yyyy";
  let start: Date;
  let end: Date;

  switch (view) {
    case "agenda":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "year":
      start = startOfYear(date);
      end = endOfYear(date);
      break;
    case "month":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "week":
      start = startOfWeek(date);
      end = endOfWeek(date);
      break;
    case "day":
      return format(date, formatString, { locale: appDateLocale });
    default:
      return "Erro ao formatar intervalo";
  }

  return `${format(start, formatString, { locale: appDateLocale })} - ${format(end, formatString, { locale: appDateLocale })}`;
}

export function navigateDate(date: Date, view: TCalendarView, direction: "previous" | "next"): Date {
  const operations = {
    agenda: direction === "next" ? addMonths : subMonths,
    year: direction === "next" ? addYears : subYears,
    month: direction === "next" ? addMonths : subMonths,
    week: direction === "next" ? addWeeks : subWeeks,
    day: direction === "next" ? addDays : subDays,
  };

  return operations[view](date, 1);
}

export function getAppointmentsCount(appointments: IAppointment[], date: Date, view: TCalendarView): number {
  const compareFns = {
    agenda: isSameMonth,
    year: isSameYear,
    day: isSameDay,
    week: isSameWeek,
    month: isSameMonth,
  };

  return appointments.filter(appointment => compareFns[view](new Date(appointment.startDate), date)).length;
}

// ================ Week and day view helper functions ================ //

export function getCurrentAppointments(appointments: IAppointment[]) {
  const now = new Date();
  return appointments.filter(appointment => isWithinInterval(now, { start: parseISO(appointment.startDate), end: parseISO(appointment.endDate) })) || null;
}

export function groupAppointments(dayAppointments: IAppointment[]) {
  const sortedAppointments = dayAppointments.sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  const groups: IAppointment[][] = [];

  for (const appointment of sortedAppointments) {
    const appointmentStart = parseISO(appointment.startDate);

    let placed = false;
    for (const group of groups) {
      const lastAppointmentInGroup = group[group.length - 1];
      const lastAppointmentEnd = parseISO(lastAppointmentInGroup.endDate);

      if (appointmentStart >= lastAppointmentEnd) {
        group.push(appointment);
        placed = true;
        break;
      }
    }

    if (!placed) groups.push([appointment]);
  }

  return groups;
}

export function getAppointmentBlockStyle(appointment: IAppointment, day: Date, groupIndex: number, groupSize: number, visibleHoursRange?: { from: number; to: number }) {
  const startDate = parseISO(appointment.startDate);
  const dayStart = new Date(day.setHours(0, 0, 0, 0));
  const appointmentStart = startDate < dayStart ? dayStart : startDate;
  const startMinutes = differenceInMinutes(appointmentStart, dayStart);

  let top;

  if (visibleHoursRange) {
    const visibleStartMinutes = visibleHoursRange.from * 60;
    const visibleEndMinutes = visibleHoursRange.to * 60;
    const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;
    top = ((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100;
  } else {
    top = (startMinutes / 1440) * 100;
  }

  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}

export function isWorkingHour(day: Date, hour: number, workingHours: TWorkingHours) {
  const dayIndex = day.getDay() as keyof typeof workingHours;
  const dayHours = workingHours[dayIndex];
  return hour >= dayHours.from && hour < dayHours.to;
}

export function getVisibleHours(visibleHours: TVisibleHours, singleDayAppointments: IAppointment[]) {
  let earliestAppointmentHour = visibleHours.from;
  let latestAppointmentHour = visibleHours.to;

  singleDayAppointments.forEach(appointment => {
    const startHour = parseISO(appointment.startDate).getHours();
    const endTime = parseISO(appointment.endDate);
    const endHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0);
    if (startHour < earliestAppointmentHour) earliestAppointmentHour = startHour;
    if (endHour > latestAppointmentHour) latestAppointmentHour = endHour;
  });

  latestAppointmentHour = Math.min(latestAppointmentHour, 24);

  const hours = Array.from({ length: latestAppointmentHour - earliestAppointmentHour }, (_, i) => i + earliestAppointmentHour);

  return { hours, earliestAppointmentHour, latestAppointmentHour };
}

// ================ Month view helper functions ================ //

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
  const totalDays = firstDayOfMonth + daysInMonth;

  const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
  }));

  const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(currentYear, currentMonth, i + 1),
  }));

  const nextMonthCells = Array.from({ length: (7 - (totalDays % 7)) % 7 }, (_, i) => ({
    day: i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth + 1, i + 1),
  }));

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthAppointmentPositions(multiDayAppointments: IAppointment[], singleDayAppointments: IAppointment[], selectedDate: Date) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const appointmentPositions: { [key: string]: number } = {};
  const occupiedPositions: { [key: string]: boolean[] } = {};

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach(day => {
    occupiedPositions[day.toISOString()] = [false, false, false];
  });

  const sortedAppointments = [
    ...multiDayAppointments.sort((a, b) => {
      const aDuration = differenceInDays(parseISO(a.endDate), parseISO(a.startDate));
      const bDuration = differenceInDays(parseISO(b.endDate), parseISO(b.startDate));
      return bDuration - aDuration || parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
    }),
    ...singleDayAppointments.sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()),
  ];

  sortedAppointments.forEach(appointment => {
    const appointmentStart = parseISO(appointment.startDate);
    const appointmentEnd = parseISO(appointment.endDate);
    const appointmentDays = eachDayOfInterval({
      start: appointmentStart < monthStart ? monthStart : appointmentStart,
      end: appointmentEnd > monthEnd ? monthEnd : appointmentEnd,
    });

    let position = -1;

    for (let i = 0; i < 3; i++) {
      if (
        appointmentDays.every(day => {
          const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
          return dayPositions && !dayPositions[i];
        })
      ) {
        position = i;
        break;
      }
    }

    if (position !== -1) {
      appointmentDays.forEach(day => {
        const dayKey = startOfDay(day).toISOString();
        occupiedPositions[dayKey][position] = true;
      });
      appointmentPositions[appointment.id] = position;
    }
  });

  return appointmentPositions;
}

export function getMonthCellAppointments(date: Date, appointments: IAppointment[], appointmentPositions: Record<string, number>) {
  const appointmentsForDate = appointments.filter(appointment => {
    const appointmentStart = parseISO(appointment.startDate);
    const appointmentEnd = parseISO(appointment.endDate);
    return (date >= appointmentStart && date <= appointmentEnd) || isSameDay(date, appointmentStart) || isSameDay(date, appointmentEnd);
  });

  return appointmentsForDate
    .map(appointment => ({
      ...appointment,
      position: appointmentPositions[appointment.id] ?? -1,
      isMultiDay: appointment.startDate !== appointment.endDate,
    }))
    .sort((a, b) => {
      if (a.isMultiDay && !b.isMultiDay) return -1;
      if (!a.isMultiDay && b.isMultiDay) return 1;
      return a.position - b.position;
    });
}
