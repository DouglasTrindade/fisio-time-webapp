"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type {
  Attendance,
  AttendanceCreateInput,
  AttendanceFilters,
  AttendanceUpdateInput,
  AttendanceType,
} from "@/app/types/attendance"
import { AttendanceType as PrismaAttendanceType } from "@prisma/client"
import { attendancesCrudConfig } from "@/app/(protected)/atendimentos/_components/config"
import { createCrudContext } from "@/contexts/crud/createCrudContext"
import type { CrudContextValue } from "@/contexts/crud/types"

type AttendancesCrudValue = CrudContextValue<
  Attendance,
  AttendanceCreateInput,
  AttendanceUpdateInput,
  AttendanceFilters
>

interface AttendancesContextValue extends AttendancesCrudValue {
  isDialogOpen: boolean
  creatingType: AttendanceType
  editingAttendance: Attendance | null
  openNew: (type: AttendanceType) => void
  openEdit: (attendance: Attendance) => void
  closeDialog: () => void
  handleSearch: (value: string) => void
  handlePageChange: (page: number) => void
  handleSortChange: (value: string) => void
}

const { CrudProvider, useCrud } = createCrudContext<
  Attendance,
  AttendanceCreateInput,
  AttendanceUpdateInput,
  AttendanceFilters
>(attendancesCrudConfig)

const AttendancesContext = createContext<AttendancesContextValue | null>(null)

const AttendancesProviderInner = ({ children }: { children: ReactNode }) => {
  const crud = useCrud()
  const [dialogState, setDialogState] = useState<{
    type: AttendanceType
    attendance: Attendance | null
  } | null>(null)

  const handleSearch = (value: string) => {
    crud.setFilters((prev) => ({ ...prev, search: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    crud.setFilters((prev) => ({ ...prev, page }))
  }

  const handleSortChange = (sortValue: string) => {
    const [field, order] = sortValue.split("-")
    crud.setFilters((prev) => ({
      ...prev,
      sortBy: field as AttendanceFilters["sortBy"],
      sortOrder: (order as "asc" | "desc") ?? "desc",
      page: 1,
    }))
  }

  const value = useMemo(
    () => ({
      ...crud,
      isDialogOpen: !!dialogState,
      creatingType: dialogState?.type ?? PrismaAttendanceType.EVALUATION,
      editingAttendance: dialogState?.attendance ?? null,
      openNew: (type: AttendanceType) =>
        setDialogState({ type, attendance: null }),
      openEdit: (attendance: Attendance) =>
        setDialogState({ type: attendance.type, attendance }),
      closeDialog: () => setDialogState(null),
      handleSearch,
      handlePageChange,
      handleSortChange,
    }),
    [
      crud,
      dialogState,
      handleSearch,
      handlePageChange,
      handleSortChange,
    ]
  )

  return (
    <AttendancesContext.Provider value={value}>
      {children}
    </AttendancesContext.Provider>
  )
}

export const AttendancesProvider = ({ children }: { children: ReactNode }) => (
  <CrudProvider>
    <AttendancesProviderInner>{children}</AttendancesProviderInner>
  </CrudProvider>
)

export const useAttendancesContext = () => {
  const context = useContext(AttendancesContext)
  if (!context) {
    throw new Error("useAttendancesContext must be used within AttendancesProvider")
  }
  return context
}
