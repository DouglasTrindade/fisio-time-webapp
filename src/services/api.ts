"use client"

import type { Patient, PatientCreateInput, PatientFilters, PaginatedResponse, ApiResponse } from "@/types/patient"

const API_BASE_URL = "/api"

class PatientService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  }

  async getPatients(filters: PatientFilters = {}): Promise<PaginatedResponse<Patient>> {
    const params = new URLSearchParams()

    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())
    if (filters.search) params.append("search", filters.search)
    if (filters.sortBy) params.append("sortBy", filters.sortBy)
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)

    const queryString = params.toString()
    const endpoint = `/patients${queryString ? `?${queryString}` : ""}`

    const response = await this.request<PaginatedResponse<Patient>>(endpoint)
    return response.data!
  }

  async getPatientById(id: string): Promise<Patient> {
    const response = await this.request<Patient>(`/patients/${id}`)
    return response.data!
  }

  async createPatient(data: PatientCreateInput): Promise<Patient> {
    const response = await this.request<Patient>("/patients", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        birthDate: data.birthDate?.toISOString() || "",
        notes: data.notes || "",
      }),
    })
    return response.data!
  }

  async updatePatient(id: string, data: Partial<PatientCreateInput>): Promise<Patient> {
    const response = await this.request<Patient>(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        birthDate: data.birthDate?.toISOString() || "",
        notes: data.notes || "",
      }),
    })
    return response.data!
  }

  async deletePatient(id: string): Promise<void> {
    await this.request(`/patients/${id}`, {
      method: "DELETE",
    })
  }

  async searchPatients(query: string, limit = 10): Promise<Patient[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    })

    const response = await this.request<Patient[]>(`/patients/search?${params}`)
    return response.data!
  }

  async getPatientStats() {
    const response = await this.request(`/patients/stats`)
    return response.data!
  }
}

export const patientService = new PatientService()
