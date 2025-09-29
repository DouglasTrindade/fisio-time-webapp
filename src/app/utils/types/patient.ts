import type { Patient as PrismaPatient } from "@prisma/client";

export type Patient = PrismaPatient;

export interface PatientCreateInput {
  name: string;
  phone: string;
  email?: string;
  birthDate?: Date;
  notes?: string;
}

export interface PatientUpdateInput extends Partial<PatientCreateInput> {
  id: string;
}

export interface PatientApiData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientApiInput {
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  notes?: string;
}

export interface PatientFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "phone" | "email";
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
