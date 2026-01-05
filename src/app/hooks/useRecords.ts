"use client";

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "../services/api";
import type { RecordsResponse, ApiResponse } from "@/app/types/api";

type UseRecordsOptions<T> = Partial<
  Omit<UseQueryOptions<RecordsResponse<T>, Error>, "queryKey" | "queryFn">
>;

export const useRecords = <T>(
  endpoint: string,
  query?: Record<string, unknown>,
  options?: UseRecordsOptions<T>
) => {
  const queryResult = useQuery<RecordsResponse<T>, Error>({
    queryKey: [endpoint, query],
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<RecordsResponse<T>>>(
        endpoint,
        {
          params: query,
        }
      );

      if (!response.data) {
        throw new Error("Resposta da API não contém dados");
      }

      return {
        records: response.data.records,
        pagination: response.data.pagination,
      };
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  return {
    ...queryResult,
    records: queryResult.data?.records ?? [],
    pagination: queryResult.data?.pagination,
  };
};

export const useCreateRecord = <TData = unknown, TVariables = unknown>(
  endpoint: string
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) =>
      apiRequest<TData>(endpoint, { method: "POST", data: variables }),
    onSuccess: () => {
      toast.success("Criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar");
    },
  });
};
