import type { TAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/types";

export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

export interface IAppointment {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  color: TAppointment;
  description: string;
  user: IUser;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
