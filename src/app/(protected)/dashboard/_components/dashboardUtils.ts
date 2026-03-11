import type { Appointment } from "@/types/appointment";
import type { Patient } from "@/types/patient";
import { Status } from "@prisma/client";
import {
  BIRTHDAY_WINDOW_DAYS,
  DAY_IN_MS,
  INACTIVE_THRESHOLD_DAYS,
  NEW_PATIENT_WINDOW_DAYS,
} from "./dashboardConstants";

export const toDateKey = (date: Date) => {
  const normalized = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );
  return normalized.toISOString().slice(0, 10);
};

export const formatTime = (date: string) => {
  const parsed = new Date(date);
  return parsed.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

export type InactivePatient = { id: string; name: string; days: number };
export type UpcomingBirthday = {
  id: string;
  name: string;
  nextBirthday: Date;
  diffDays: number;
};

export type DashboardMetrics = {
  totalPatients: number;
  newPatients: number;
  missedAppointments: number;
  upcomingAppointments: Appointment[];
  inactivePatients: InactivePatient[];
  upcomingBirthdays: UpcomingBirthday[];
};

export const getDashboardMetrics = (
  patients: Patient[],
  appointments: Appointment[],
  patientTotal?: number,
): DashboardMetrics => {
  const now = new Date();
  const patientsCreatedWindow = new Date(
    now.getTime() - NEW_PATIENT_WINDOW_DAYS * DAY_IN_MS,
  );

  const total = patientTotal ?? patients.length;
  const newOnes = patients.filter((patient) => {
    if (!patient?.createdAt) return false;
    const createdAt = new Date(patient.createdAt);
    return createdAt >= patientsCreatedWindow;
  }).length;

  const sortedUpcoming = appointments
    .filter((appointment) => new Date(appointment.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const noShows = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate < now && appointment.status === Status.WAITING;
  }).length;

  const lastVisitByPatient = appointments.reduce((acc, appointment) => {
    if (!appointment.patientId) return acc;
    const current = acc.get(appointment.patientId);
    const appointmentDate = new Date(appointment.date);
    if (!current || appointmentDate > current) {
      acc.set(appointment.patientId, appointmentDate);
    }
    return acc;
  }, new Map<string, Date>());

  const inactive = patients
    .map((patient) => {
      const lastVisit =
        lastVisitByPatient.get(patient.id) ||
        (patient.createdAt ? new Date(patient.createdAt) : null);
      if (!lastVisit) return null;
      const days = Math.floor(
        (now.getTime() - lastVisit.getTime()) / DAY_IN_MS,
      );
      if (days < INACTIVE_THRESHOLD_DAYS) return null;
      return {
        id: patient.id,
        name: patient.name || "Paciente sem nome",
        days,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.days ?? 0) - (a!.days ?? 0))
    .slice(0, 4) as InactivePatient[];

  const birthdays = patients
    .filter((patient) => patient.birthDate)
    .map((patient) => {
      const birthDate = new Date(patient.birthDate!);
      const nextBirthday = new Date(
        now.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate(),
      );
      if (nextBirthday < now) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const diffDays = Math.ceil(
        (nextBirthday.getTime() - now.getTime()) / DAY_IN_MS,
      );
      return {
        id: patient.id,
        name: patient.name || "Paciente sem nome",
        nextBirthday,
        diffDays,
      };
    })
    .filter((patient) => patient.diffDays <= BIRTHDAY_WINDOW_DAYS)
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 4);

  return {
    totalPatients: total,
    newPatients: newOnes,
    missedAppointments: noShows,
    upcomingAppointments: sortedUpcoming,
    inactivePatients: inactive,
    upcomingBirthdays: birthdays,
  };
};

export const getAppointmentTrendData = (
  appointments: Appointment[],
  days = 7,
) => {
  const grouped = appointments.reduce<Record<string, Appointment[]>>(
    (acc, appointment) => {
      const key = toDateKey(new Date(appointment.date));
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(appointment);
      return acc;
    },
    {},
  );
  const reference = new Date();
  return Array.from({ length: days }).map((_, index) => {
    const day = new Date(reference);
    day.setDate(reference.getDate() - (days - 1 - index));
    const key = toDateKey(day);
    const dayAppointments = grouped[key] ?? [];
    const scheduled = dayAppointments.length;
    const confirmed = dayAppointments.filter(
      (item) => item.status === Status.CONFIRMED,
    ).length;
    const canceled = dayAppointments.filter(
      (item) => item.status === Status.CANCELED,
    ).length;

    return {
      key,
      label: day.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
      scheduled,
      confirmed,
      canceled,
    };
  });
};
