"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "../services/api";
import type { ApiResponse } from "@/types/api";

type UseRecordOptions<T> = Partial<
  Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">
>;

export const useRecord = <T>(
  endpoint: string,
  id?: string,
  options?: UseRecordOptions<T>
) => {
  const { enabled, staleTime, ...restOptions } = options ?? {};
  const isEnabled = (enabled ?? true) && !!id;

  return useQuery<T, Error>({
    queryKey: [endpoint, id],
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<T>>(`${endpoint}/${id}`);
      if (!response.data) throw new Error("Dados não encontrados");
      return response.data;
    },
    enabled: isEnabled,
    staleTime: staleTime ?? 2 * 60 * 1000,
    ...restOptions,
  });
};

export const useUpdateRecord = <TData = unknown, TVariables = unknown>(
  endpoint: string
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<TData>,
    Error,
    { id: string; data: TVariables }
  >({
    mutationFn: async ({ id, data }) =>
      apiRequest<ApiResponse<TData>>(`${endpoint}/${id}`, {
        method: "PUT",
        data,
      }),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      queryClient.invalidateQueries({ queryKey: [endpoint, variables.id] });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar");
    },
  });
};

export const useDeleteRecord = (endpoint: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) =>
      apiRequest<void>(`${endpoint}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir");
    },
  });
};
