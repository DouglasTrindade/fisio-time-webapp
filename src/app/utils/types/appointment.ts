export type AppointmentStatus = "waiting" | "attended" 

export interface Appointment {
  id: string;
  name: string; 
  phone: string;
  status: AppointmentStatus;
  date: Date;
  notes?: string;
  patientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCreateInput {
  name: string;
  phone: string;
  date: Date;
  status?: AppointmentStatus;
  notes?: string;
  patientId?: string;
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
