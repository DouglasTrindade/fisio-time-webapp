import type { Patient as PrismaPatient } from "@prisma/client"

export type Patient = PrismaPatient

export interface PatientCreateInput {
  name: string
  phone: string
  email?: string
  birthDate?: Date
  notes?: string
}

export interface PatientUpdateInput extends Partial<PatientCreateInput> {
  id: string
}

export interface PatientFilters {
  search?: string
  page?: number
  limit?: number
  sortBy?: "name" | "createdAt" | "phone" | "email"
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
