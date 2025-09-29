"use client";

import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentFilters,
  AppointmentStatus,
  PaginatedResponse,
  ApiResponse,
} from "@/app/utils/types/appointment";

const API_BASE_URL = "/api";

interface AppointmentApiData {
  id: string;
  phone: string;
  date: string;
  status: AppointmentStatus;
  patientId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentApiInput {
  phone: string;
  date: string;
  status?: AppointmentStatus;
  notes?: string | null;
  patientId?: string | null;
}

class AppointmentService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error);
      throw error;
    }
  }

  private convertApiDataToAppointment(
    apiData: AppointmentApiData
  ): Appointment {
    return {
      ...apiData,
      date: apiData.date,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
    };
  }

  private convertInputToApiInput(
    input: AppointmentCreateInput
  ): AppointmentApiInput {
    return {
      phone: input.phone,
      date: input.date,
      status: input.status,
      notes: input.notes ?? "",
      patientId: input.patientId ?? null,
    };
  }

  async getAppointments(
    filters: AppointmentFilters = {}
  ): Promise<PaginatedResponse<Appointment>> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `/appointments${queryString ? `?${queryString}` : ""}`;

    const response = await this.request<PaginatedResponse<AppointmentApiData>>(
      endpoint
    );

    const convertedData = {
      ...response.data!,
      data: response.data!.data.map(this.convertApiDataToAppointment),
    };

    return convertedData;
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await this.request<AppointmentApiData>(
      `/appointments/${id}`
    );
    return this.convertApiDataToAppointment(response.data!);
  }

  async createAppointment(data: AppointmentCreateInput): Promise<Appointment> {
    const payload = this.convertInputToApiInput(data);

    const response = await this.request<AppointmentApiData>("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return this.convertApiDataToAppointment(response.data!);
  }

  async updateAppointment(
    id: string,
    data: Partial<AppointmentCreateInput>
  ): Promise<Appointment> {
    const payload: Partial<AppointmentApiInput> = {};

    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.date !== undefined) payload.date = data.date;
    if (data.status !== undefined) payload.status = data.status;
    if (data.notes !== undefined) payload.notes = data.notes ?? "";
    if (data.patientId !== undefined) payload.patientId = data.patientId;

    const response = await this.request<AppointmentApiData>(
      `/appointments/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    return this.convertApiDataToAppointment(response.data!);
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.request(`/appointments/${id}`, {
      method: "DELETE",
    });
  }
}

export const appointmentService = new AppointmentService();
