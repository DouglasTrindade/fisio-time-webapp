"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiRequest } from "../services/api"

export const useRecord = <T = unknown>(endpoint: string, id?: string) => {
  return useQuery<T>({
    queryKey: [endpoint, id],
    queryFn: async () => apiRequest<T>(`${endpoint}/${id}`),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export const useUpdateRecord = <TData = unknown, TVariables = unknown>(
  endpoint: string
) => {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, { id: string; data: TVariables }>({
    mutationFn: async ({ id, data }) =>
      apiRequest<TData>(`${endpoint}/${id}`, { method: "PUT", data }),
    onSuccess: (data: any) => {
      toast.success("Atualizado com sucesso!")
      queryClient.invalidateQueries({ queryKey: [endpoint] })
      if (data?.id) queryClient.invalidateQueries({ queryKey: [endpoint, data.id] })
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar")
    },
  })
}

export const useDeleteRecord = (endpoint: string) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) =>
      apiRequest<void>(`${endpoint}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Excluído com sucesso!")
      queryClient.invalidateQueries({ queryKey: [endpoint] })
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir")
    },
  })
}
