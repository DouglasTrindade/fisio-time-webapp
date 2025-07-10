"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Appointment, AppointmentStatus } from "@/app/utils/types/appointment";

const appointmentService = {
  getAppointments: async (date?: Date): Promise<Appointment[]> => {
    // Simular dados - substitua pela chamada real da API
    const mockAppointments: Appointment[] = [
      { id: "1", name: "João da Silva", phone: "(11) 99999-1234", time: '15:00', date: new Date(), status: 'waiting' },
      { id: "2", name: "Maria Oliveira", phone: "(11) 98888-5678", time: '12:00', date: new Date(), status: 'waiting' },
      { id: "3", name: "Felipe Costa", phone: "(11) 92233-1234", time: '08:00', date: new Date(), status: 'attended' },
      { id: "4", name: "Gustavo Alves", phone: "(11) 96662-3342", time: '11:00', date: new Date(), status: 'attended' },
      { id: "5", name: "Antonio Neto", phone: "(11) 93333-3342", time: '09:00', date: new Date(), status: 'waiting' },
    ];

    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      return mockAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
        return appointmentDate === dateStr;
      });
    }
    
    return mockAppointments;
  },

  updateAppointmentStatus: async (id: string, status: AppointmentStatus): Promise<Appointment> => {
    // Simular atualização - substitua pela chamada real da API
    const appointments = await appointmentService.getAppointments();
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) throw new Error("Agendamento não encontrado");
    
    return { ...appointment, status };
  },

  getAppointmentsByDateRange: async (startDate: Date, endDate: Date): Promise<Appointment[]> => {
    // Simular busca por intervalo - substitua pela chamada real da API
    const appointments = await appointmentService.getAppointments();
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
  }
};

export const useAppointments = (date?: Date) => {
  return useQuery({
    queryKey: ["appointments", date?.toISOString()],
    queryFn: () => appointmentService.getAppointments(date),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export const useAppointmentsByDateRange = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["appointments", "range", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => appointmentService.getAppointmentsByDateRange(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export const useUpdateAppointmentStatus = () => {
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
    },
  });
}