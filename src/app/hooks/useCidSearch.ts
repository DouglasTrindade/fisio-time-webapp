"use client"

import { useQuery } from "@tanstack/react-query"
import { apiRequest } from "@/app/services/api"
import type { ApiResponse, RecordsResponse } from "@/app/types/api"
import type { CidRecord } from "@/app/types/cid"

interface UseCidSearchOptions {
  enabled?: boolean
  limit?: number
}

export const useCidSearch = (
  search: string,
  { enabled = true, limit = 20 }: UseCidSearchOptions = {}
) => {
  return useQuery({
    queryKey: ["cid-search", search, limit],
    queryFn: async () => {
      const response = await apiRequest<
        ApiResponse<RecordsResponse<CidRecord>>
      >("/cids", {
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
