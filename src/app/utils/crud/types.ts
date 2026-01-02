import type { Dispatch, SetStateAction } from "react"

export interface CrudConfig<TFilters> {
  endpoint: string
  defaultFilters: TFilters
}

export interface CrudPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface CrudContextValue<TRecord, TCreate, TUpdate, TFilters> {
  records: TRecord[]
  pagination?: CrudPagination
  isLoading: boolean
  isFetching: boolean
  filters: TFilters
  setFilters: Dispatch<SetStateAction<TFilters>>
  refetch: () => void
  handleCreate: (data: TCreate) => Promise<unknown>
  handleUpdate: (id: string, data: TUpdate) => Promise<unknown>
  handleDelete: (id: string) => Promise<unknown>
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}
