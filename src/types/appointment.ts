export type AppointmentStatus = "waiting" | "attended";

export interface Appointment {
  id: string;
  name: string;
  phone: string;
}
