"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { patientService } from "@/app/utils/services/api";
import type { PatientFilters, PatientCreateInput } from "@/app/utils/types/patient";

export function usePatients(filters: PatientFilters = {}) {
  return useQuery({
    queryKey: ["patients", filters],
    queryFn: () => patientService.getPatients(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => patientService.getPatientById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientCreateInput) =>
      patientService.createPatient(data),
    onSuccess: () => {
      toast.success("Paciente criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar paciente");
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PatientCreateInput>;
    }) => patientService.updatePatient(id, data),
    onSuccess: (updatedPatient) => {
      toast.success("Paciente atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({
        queryKey: ["patient", updatedPatient.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar paciente");
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => {
      toast.success("Paciente excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir paciente");
    },
  });
}

export function useSearchPatients(query: string, limit = 10) {
  return useQuery({
    queryKey: ["patients", "search", query, limit],
    queryFn: () => patientService.searchPatients(query, limit),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function usePatientStats() {
  return useQuery({
    queryKey: ["patients", "stats"],
    queryFn: () => patientService.getPatientStats(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
