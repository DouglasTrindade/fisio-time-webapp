"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import type { Patient, PatientFilters } from "@/app/types/patient"
import type { PatientSchema } from "@/app/(protected)/pacientes/_components/Fields/schema"
import { createCrudContext } from "@/contexts/crud/createCrudContext"
import { patientsCrudConfig } from "@/app/(protected)/pacientes/_components/config"

interface PatientsUiContextValue {
  isNewDialogOpen: boolean
  editingPatientId: string | null
  openNew: () => void
  closeNew: () => void
  openEdit: (id: string) => void
  closeEdit: () => void
  handleSearch: (search: string) => void
  handlePageChange: (page: number) => void
  handleSortChange: (sortValue: string) => void
}

const { CrudProvider, useCrud, useCrudOptional } = createCrudContext<
  Patient,
  PatientSchema,
  PatientSchema,
  PatientFilters
>(patientsCrudConfig)

const PatientsUiContext = createContext<PatientsUiContextValue | null>(null)

const PatientsUiProvider = ({ children }: { children: ReactNode }) => {
  const { setFilters } = useCrud()
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null)

  const openNew = useCallback(() => setIsNewDialogOpen(true), [])
  const closeNew = useCallback(() => setIsNewDialogOpen(false), [])
  const openEdit = useCallback((id: string) => setEditingPatientId(id), [])
  const closeEdit = useCallback(() => setEditingPatientId(null), [])

  const handleSearch = useCallback(
    (search: string) => {
      setFilters((prev) => ({ ...prev, search, page: 1 }))
    },
    [setFilters],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters((prev) => ({ ...prev, page }))
    },
    [setFilters],
  )

  const handleSortChange = useCallback(
    (sortValue: string) => {
      const [field, order] = sortValue.split("-")
      setFilters((prev) => ({
        ...prev,
        sortBy: field as PatientFilters["sortBy"],
        sortOrder: order as "asc" | "desc",
        page: 1,
      }))
    },
    [setFilters],
  )

  const value = useMemo(
    () => ({
      isNewDialogOpen,
      editingPatientId,
      openNew,
      closeNew,
      openEdit,
      closeEdit,
      handleSearch,
      handlePageChange,
      handleSortChange,
    }),
    [
      isNewDialogOpen,
      editingPatientId,
      openNew,
      closeNew,
      openEdit,
      closeEdit,
      handleSearch,
      handlePageChange,
      handleSortChange,
    ],
  )

  return (
    <PatientsUiContext.Provider value={value}>
      {children}
    </PatientsUiContext.Provider>
  )
}

export const PatientsProvider = ({ children }: { children: ReactNode }) => (
  <CrudProvider>
    <PatientsUiProvider>{children}</PatientsUiProvider>
  </CrudProvider>
)

const usePatientsUiContext = () => {
  const context = useContext(PatientsUiContext)
  if (!context) {
    throw new Error("usePatientsContext must be used within PatientsProvider")
  }
  return context
}

const usePatientsContextBase = () => {
  const crud = useCrud()
  const ui = usePatientsUiContext()
  return { ...crud, ...ui }
}

export const usePatientsContext = usePatientsContextBase
export const usePatientContext = usePatientsContextBase
export const usePatientsContextOptional = () => {
  const crud = useCrudOptional()
  const ui = useContext(PatientsUiContext)
  if (!crud || !ui) {
    return null
  }
  return { ...crud, ...ui }
}
