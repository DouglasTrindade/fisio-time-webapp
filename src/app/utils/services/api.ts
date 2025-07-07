"use client";

import type {
  Patient,
  PatientCreateInput,
  PatientFilters,
  PaginatedResponse,
  ApiResponse,
  PatientApiData,
  PatientApiInput,
} from "@/app/utils/types/patient";

const API_BASE_URL = "/api";

class PatientService {
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

  private convertApiDataToPatient(apiData: PatientApiData): Patient {
    return {
      ...apiData,
      birthDate: apiData.birthDate ? new Date(apiData.birthDate) : null,
      createdAt: new Date(apiData.createdAt),
      updatedAt: new Date(apiData.updatedAt),
    };
  }

  private convertInputToApiInput(input: PatientCreateInput): PatientApiInput {
    return {
      name: input.name,
      phone: input.phone,
      email: input.email || "",
      birthDate: input.birthDate?.toISOString() || "",
      notes: input.notes || "",
    };
  }

  async getPatients(
    filters: PatientFilters = {}
  ): Promise<PaginatedResponse<Patient>> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `/patients${queryString ? `?${queryString}` : ""}`;

    const response = await this.request<PaginatedResponse<PatientApiData>>(
      endpoint
    );

    const convertedData = {
      ...response.data!,
      data: response.data!.data.map(this.convertApiDataToPatient),
    };

    return convertedData;
  }

  async getPatientById(id: string): Promise<Patient> {
    const response = await this.request<PatientApiData>(`/patients/${id}`);
    return this.convertApiDataToPatient(response.data!);
  }

  async createPatient(data: PatientCreateInput): Promise<Patient> {
    const payload = this.convertInputToApiInput(data);

    const response = await this.request<PatientApiData>("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return this.convertApiDataToPatient(response.data!);
  }

  async updatePatient(
    id: string,
    data: Partial<PatientCreateInput>
  ): Promise<Patient> {
    const payload: Partial<PatientApiInput> = {};

    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email || "";
    if (data.birthDate !== undefined)
      payload.birthDate = data.birthDate?.toISOString() || "";
    if (data.notes !== undefined) payload.notes = data.notes || "";

    const response = await this.request<PatientApiData>(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return this.convertApiDataToPatient(response.data!);
  }

  async deletePatient(id: string): Promise<void> {
    await this.request(`/patients/${id}`, {
      method: "DELETE",
    });
  }

  async searchPatients(query: string, limit = 10): Promise<Patient[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const response = await this.request<PatientApiData[]>(
      `/patients/search?${params}`
    );
    return response.data!.map(this.convertApiDataToPatient);
  }

  async getPatientStats() {
    const response = await this.request(`/patients/stats`);
    return response.data!;
  }
}

export const patientService = new PatientService();
