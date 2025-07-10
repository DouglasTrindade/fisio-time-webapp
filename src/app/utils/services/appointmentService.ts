import type { Appointment, AppointmentStatus, AppointmentCreateInput, AppointmentFilters } from '@/app/utils/types/appointment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = '/api/appointments';

export const appointmentService = {
  async getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
    const params = new URLSearchParams();
    
    if (filters.date) {
      params.append('date', filters.date.toISOString());
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.patientId) {
      params.append('patientId', filters.patientId);
    }

    const response = await fetch(`${API_BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }

    const data = await response.json();
    return data.map((appointment: any) => ({
      ...appointment,
      date: new Date(appointment.date)
    }));
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch appointment');
    }

    const appointment = await response.json();
    return {
      ...appointment,
      date: new Date(appointment.date)
    };
  },

  async createAppointment(data: AppointmentCreateInput): Promise<Appointment> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }

    const appointment = await response.json();
    return {
      ...appointment,
      date: new Date(appointment.date)
    };
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update appointment status');
    }

    const appointment = await response.json();
    return {
      ...appointment,
      date: new Date(appointment.date)
    };
  },

  async deleteAppointment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete appointment');
    }
  },

  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const appointments = await this.getAppointments();
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
  }
};

export function useAppointments(date?: Date) {
  return useQuery({
    queryKey: ["appointments", date?.toISOString()],
    queryFn: () => appointmentService.getAppointments(date ? { date } : {}),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentService.updateAppointmentStatus(id, status),
    onSuccess: () => {
      toast.success("Status do agendamento atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar status do agendamento");
    }
})}