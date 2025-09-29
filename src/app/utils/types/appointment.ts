import { Appointment as PrismaAppointment, Status } from "@prisma/client";

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

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
