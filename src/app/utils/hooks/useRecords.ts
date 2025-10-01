"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiRequest } from "../services/api"

export const useRecords = <T = unknown>(
  endpoint: string,
  query?: Record<string, any>
) => {
  return useQuery<T[]>({
    queryKey: [endpoint, query],
    queryFn: async () => apiRequest<T[]>(endpoint, { params: query }),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateRecord = <TData = unknown, TVariables = unknown>(
  endpoint: string
) => {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) =>
      apiRequest<TData>(endpoint, { method: "POST", data: variables }),
    onSuccess: () => {
      toast.success("Criado com sucesso!")
      queryClient.invalidateQueries({ queryKey: [endpoint] })
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar")
    },
  })
}
