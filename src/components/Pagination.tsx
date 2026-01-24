"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RecordsResponse } from "@/types/api"

export type PaginationMeta = RecordsResponse<unknown>["pagination"]

interface PaginationProps {
  pagination?: PaginationMeta | null
  onPageChange?: (page: number) => void
  className?: string
  resourceLabel?: string
}

export const Pagination = ({
  pagination,
  onPageChange,
  className,
  resourceLabel,
}: PaginationProps) => {
  if (!pagination) return null

  const firstItem = (pagination.page - 1) * pagination.limit + 1
  const lastItem = Math.min(pagination.page * pagination.limit, pagination.total)
  const label = resourceLabel ? ` ${resourceLabel}` : ""

  const handleChange = (nextPage: number) => {
    if (!onPageChange) return
    const clamped = Math.max(1, Math.min(nextPage, pagination.totalPages))
    if (clamped !== pagination.page) {
      onPageChange(clamped)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <p>
        Mostrando {pagination.total === 0 ? 0 : firstItem} a {pagination.total === 0 ? 0 : lastItem} de
        {" "}
        {pagination.total}
        {label}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChange(pagination.page - 1)}
          disabled={!pagination.hasPrev || !onPageChange}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <span className="text-foreground">
          Página {pagination.page} de {Math.max(1, pagination.totalPages)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChange(pagination.page + 1)}
          disabled={!pagination.hasNext || !onPageChange}
        >
          Próxima
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
