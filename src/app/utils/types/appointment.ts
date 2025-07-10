export type AppointmentStatus = "waiting" | "attended";

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  time: string;
  date: Date;
  status: AppointmentStatus;
  patientId?: string;
}

export interface AppointmentFilters {
  date?: Date;
  status?: AppointmentStatus;
  patientId?: string;
}

export interface AppointmentCreateInput {
  name: string;
  phone: string;
  time: string;
  date: Date;
  patientId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
}