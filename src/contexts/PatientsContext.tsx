"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { Patient, PatientFilters } from "@/app/types/patient"
import type { PatientSchema } from "@/app/(protected)/pacientes/_components/schema"
import { createCrudContext } from "@/contexts/crud/createCrudContext"
import type { CrudContextValue } from "@/contexts/crud/types"
import { patientsCrudConfig } from "@/app/(protected)/pacientes/_components/config"

type PatientsCrudValue = CrudContextValue<
  Patient,
  PatientSchema,
  PatientSchema,
  PatientFilters
>

interface PatientsContextValue extends PatientsCrudValue {
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

const { CrudProvider, useCrud } = createCrudContext<
  Patient,
  PatientSchema,
  PatientSchema,
  PatientFilters
>(patientsCrudConfig)

const PatientsContext = createContext<PatientsContextValue | null>(null)

const PatientsProviderInner = ({ children }: { children: ReactNode }) => {
  const crud = useCrud()
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null)

  const handleSearch = (search: string) => {
    crud.setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    crud.setFilters((prev) => ({ ...prev, page }))
  }

  const handleSortChange = (sortValue: string) => {
    const [field, order] = sortValue.split("-")
    crud.setFilters((prev) => ({
      ...prev,
      sortBy: field as PatientFilters["sortBy"],
      sortOrder: order as "asc" | "desc",
      page: 1,
    }))
  }

  const value = useMemo(
    () => ({
      ...crud,
      isNewDialogOpen,
      editingPatientId,
      openNew: () => setIsNewDialogOpen(true),
      closeNew: () => setIsNewDialogOpen(false),
      openEdit: (id: string) => setEditingPatientId(id),
      closeEdit: () => setEditingPatientId(null),
      handleSearch,
      handlePageChange,
      handleSortChange,
    }),
    [
      crud,
      isNewDialogOpen,
      editingPatientId,
      handleSearch,
      handlePageChange,
      handleSortChange,
    ]
  )

  return (
    <PatientsContext.Provider value={value}>
      {children}
    </PatientsContext.Provider>
  )
}

export const PatientsProvider = ({ children }: { children: ReactNode }) => (
  <CrudProvider>
    <PatientsProviderInner>{children}</PatientsProviderInner>
  </CrudProvider>
)

const usePatientsContextBase = () => {
  const context = useContext(PatientsContext)
  if (!context) {
    throw new Error("usePatientsContext must be used within PatientsProvider")
  }
  return context
}

export const usePatientsContext = usePatientsContextBase
export const usePatientContext = usePatientsContextBase
