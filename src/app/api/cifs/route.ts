import { NextRequest, NextResponse } from "next/server"

import type { ApiResponse } from "@/types/api"
import type { CifRecord } from "@/types/cif"
import { cifData } from "@/data/cif"
import { createApiResponse } from "@/lib/api/utils"

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

export async function GET(
  request: NextRequest,
): Promise<
  NextResponse<
    ApiResponse<{
      records: CifRecord[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
      }
    }>
  >
> {
  const url = new URL(request.url)
  const search = url.searchParams.get("search")?.trim() ?? ""
  const page = Math.max(Number.parseInt(url.searchParams.get("page") ?? "1", 10), 1)
  const limit = Math.max(Number.parseInt(url.searchParams.get("limit") ?? "20", 10), 1)

  const normalizedSearch = normalize(search)

  const filtered = normalizedSearch.length
    ? cifData.filter((item) => {
        const normalizedCode = normalize(item.code)
        const normalizedDescription = normalize(item.description)
        return (
          normalizedCode.includes(normalizedSearch) ||
          normalizedDescription.includes(normalizedSearch)
        )
      })
    : cifData

  const start = (page - 1) * limit
  const records = filtered.slice(start, start + limit)
  const total = filtered.length
  const totalPages = Math.max(Math.ceil(total / limit), 1)

  return NextResponse.json(
    createApiResponse({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }),
  )
}
