"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/app/utils/services/apiAppointment";

interface BaseRecord {
  id: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export function useRecords<T extends BaseRecord, TFilters = object>(
  endpoint: string,
  filters: TFilters = {} as TFilters
) {
  return useQuery({
    queryKey: [endpoint, filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<T>>(endpoint, {
        params: filters,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecord<T extends BaseRecord>(endpoint: string, id: string) {
  return useQuery({
    queryKey: [endpoint, id],
    queryFn: async () => {
      const response = await api.get<T>(`${endpoint}/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateRecord<TCreate, TReturn = any>(endpoint: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TCreate) => {
      const res = await api.post<TReturn>(endpoint, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao criar registro");
    },
  });
}

export function useUpdateRecord<TUpdate>(
  endpoint: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TUpdate }) => {
      const res = await api.put(`${endpoint}/${id}`, data);
      return res.data;
    },
    onSuccess: (updated) => {
      toast.success("Atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      queryClient.invalidateQueries({ queryKey: [endpoint, updated.id] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao atualizar registro");
    },
  });
}

export function useDeleteRecord(endpoint: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      toast.success("Deletado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao deletar registro");
    },
  });
}
