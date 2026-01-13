"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import type {
  Attendance,
  AttendanceCreateInput,
  AttendanceFilters,
  AttendanceUpdateInput,
  AttendanceType,
} from "@/types/attendance"
import { AttendanceType as PrismaAttendanceType } from "@prisma/client"
import { attendancesCrudConfig } from "@/app/(protected)/atendimentos/_components/config"
import { createCrudContext } from "@/contexts/crud/createCrudContext"

interface AttendancesUiContextValue {
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

const AttendancesUiContext = createContext<AttendancesUiContextValue | null>(null)

const normalizeAttendanceType = (
  value?: AttendanceType | string | null,
): AttendanceType => {
  if (!value) {
    return PrismaAttendanceType.EVALUATION
  }
  const normalized =
    typeof value === "string" ? value.toLowerCase() : value.toString().toLowerCase()
  return normalized === "evolution"
    ? PrismaAttendanceType.EVOLUTION
    : PrismaAttendanceType.EVALUATION
}

const AttendancesUiProvider = ({ children }: { children: ReactNode }) => {
  const { setFilters } = useCrud()
  const [dialogState, setDialogState] = useState<{
    type: AttendanceType
    attendance: Attendance | null
  } | null>(null)

  const handleSearch = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }))
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
        sortBy: field as AttendanceFilters["sortBy"],
        sortOrder: (order as "asc" | "desc") ?? "desc",
        page: 1,
      }))
    },
    [setFilters],
  )

  const openNew = useCallback(
    (type: AttendanceType) =>
      setDialogState({ type: normalizeAttendanceType(type), attendance: null }),
    [],
  )

  const openEdit = useCallback(
    (attendance: Attendance) =>
      setDialogState({
        type: normalizeAttendanceType(attendance.type),
        attendance,
      }),
    [],
  )

  const closeDialog = useCallback(() => setDialogState(null), [])

  const value = useMemo(
    () => ({
      isDialogOpen: !!dialogState,
      creatingType: dialogState?.type ?? PrismaAttendanceType.EVALUATION,
      editingAttendance: dialogState?.attendance ?? null,
      openNew,
      openEdit,
      closeDialog,
      handleSearch,
      handlePageChange,
      handleSortChange,
    }),
    [
      dialogState,
      openNew,
      openEdit,
      closeDialog,
      handleSearch,
      handlePageChange,
      handleSortChange,
    ]
  )

  return (
    <AttendancesUiContext.Provider value={value}>
      {children}
    </AttendancesUiContext.Provider>
  )
}

export const AttendancesProvider = ({ children }: { children: ReactNode }) => (
  <CrudProvider>
    <AttendancesUiProvider>{children}</AttendancesUiProvider>
  </CrudProvider>
)

export const useAttendancesContext = () => {
  const crud = useCrud()
  const ui = useContext(AttendancesUiContext)
  if (!ui) {
    throw new Error("useAttendancesContext must be used within AttendancesProvider")
  }
  return { ...crud, ...ui }
}
