"use client"

import { useQuery } from "@tanstack/react-query"

import type { ApiResponse, RecordsResponse } from "@/types/api"
import type { CifRecord } from "@/types/cif"
import { apiRequest } from "@/services/api"

interface UseCifSearchOptions {
  enabled?: boolean
  limit?: number
}

export const useCifSearch = (
  search: string,
  { enabled = true, limit = 20 }: UseCifSearchOptions = {},
) => {
  return useQuery({
    queryKey: ["cif-search", search, limit],
    queryFn: async () => {
      const response = await apiRequest<
        ApiResponse<RecordsResponse<CifRecord>>
      >("/cifs", {
        params: { search, limit, page: 1 },
      })

      if (!response.data) {
        throw new Error("Resposta da API não contém dados")
      }

      return response.data.records
    },
    enabled: enabled && search.trim().length >= 2,
  })
}
