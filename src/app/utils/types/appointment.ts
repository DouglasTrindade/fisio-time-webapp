export type AppointmentStatus =
  | "waiting"
  | "attended"
  | "confirmed"
  | "canceled"
  | "rescheduled";

export interface Appointment {
  id: string;
  name?: string;
  phone: string;
  date: string;
  status: AppointmentStatus;
  patientId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCreateInput {
  name?: string;
  phone: string;
  date: string;
  status?: AppointmentStatus;
  notes?: string | null;
  patientId?: string | null;
}

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
