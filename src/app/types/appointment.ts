import { Appointment as PrismaAppointment, Status } from "@prisma/client";
import type { ApiResponse, PaginatedResponse, RecordsResponse } from "./api";

export type AppointmentStatus = Status;

export interface Appointment
  extends Omit<PrismaAppointment, "date" | "createdAt" | "updatedAt"> {
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentCreateInput = Omit<
  Appointment,
  "id" | "createdAt" | "updatedAt"
>;

export interface AppointmentFilters extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  date?: string;
}

export type { RecordsResponse, ApiResponse, PaginatedResponse };
