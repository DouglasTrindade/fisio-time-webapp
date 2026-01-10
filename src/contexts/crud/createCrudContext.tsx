"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useRecords, useCreateRecord } from "@/app/hooks/useRecords"
import { useUpdateRecord, useDeleteRecord } from "@/app/hooks/useRecord"
import type { CrudConfig, CrudContextValue } from "./types"

export function createCrudContext<
  TRecord,
  TCreate,
  TUpdate,
  TFilters extends Record<string, unknown>
>(config: CrudConfig<TFilters>) {
  const CrudContext = createContext<CrudContextValue<
    TRecord,
    TCreate,
    TUpdate,
    TFilters
  > | null>(null)

  const CrudProvider = ({
    children,
    initialFilters,
  }: {
    children: ReactNode
    initialFilters?: Partial<TFilters>
  }) => {
    const [filters, setFilters] = useState<TFilters>(() => ({
      ...config.defaultFilters,
      ...(initialFilters ?? {}),
    }))

    useEffect(() => {
      if (!initialFilters) return
      setFilters((previous) => ({
        ...previous,
        ...initialFilters,
      }))
    }, [initialFilters])

    const { records, pagination, isLoading, isFetching, refetch } = useRecords<TRecord>(
      config.endpoint,
      filters
    )

    const createMutation = useCreateRecord<TRecord, TCreate>(config.endpoint)
    const updateMutation = useUpdateRecord<TRecord, TUpdate>(config.endpoint)
    const deleteMutation = useDeleteRecord(config.endpoint)

    const value = useMemo(
      () => ({
        records,
        pagination,
        isLoading,
        isFetching,
        filters,
        setFilters,
        refetch,
        handleCreate: createMutation.mutateAsync,
        handleUpdate: (id: string, data: TUpdate) =>
          updateMutation.mutateAsync({ id, data }),
        handleDelete: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
      }),
      [
        records,
        pagination,
        isLoading,
        isFetching,
        filters,
        setFilters,
        refetch,
        createMutation.isPending,
        createMutation.mutateAsync,
        updateMutation.isPending,
        updateMutation.mutateAsync,
        deleteMutation.isPending,
        deleteMutation.mutateAsync,
      ]
    )

    return <CrudContext.Provider value={value}>{children}</CrudContext.Provider>
  }

  const useCrudOptional = () => useContext(CrudContext)

  const useCrud = () => {
    const context = useCrudOptional()
    if (!context) {
      throw new Error("useCrud must be used within a CrudProvider")
    }
    return context
  }

  return { CrudProvider, useCrud, useCrudOptional }
}
