"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
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
import { ModalProvider, useModalContext } from "@/contexts/ModalContext"
import { AttendanceDialog } from "@/app/(protected)/atendimentos/_components/Modal"

interface AttendancesUiContextValue {
  creatingType: AttendanceType
  editingAttendance: Attendance | null
  openNew: (type: AttendanceType) => void
  openEdit: (attendance: Attendance) => void
  handleSearch: (value: string) => void
  handlePageChange: (page: number) => void
  handleSortChange: (value: string) => void
  clearDialogState: () => void
  dialogState: {
    type: AttendanceType
    attendance: Attendance | null
    key: number
  } | null
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
  const normalized = value ? `${value}`.toLowerCase() : ""
  return normalized === "evolution"
    ? PrismaAttendanceType.EVOLUTION
    : PrismaAttendanceType.EVALUATION
}

const AttendancesUiProvider = ({ children }: { children: ReactNode }) => {
  const { setFilters } = useCrud()
  const [dialogState, setDialogState] = useState<{
    type: AttendanceType
    attendance: Attendance | null
    key: number
  } | null>(null)
  const dialogKeyRef = useRef(0)

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

  const openNew = useCallback((type: AttendanceType) => {
    const normalized = normalizeAttendanceType(type)
    dialogKeyRef.current += 1
    setDialogState({
      type: normalized,
      attendance: null,
      key: dialogKeyRef.current,
    })
  }, [])

  const openEdit = useCallback((attendance: Attendance) => {
    const normalized = normalizeAttendanceType(attendance.type)
    dialogKeyRef.current += 1
    setDialogState({
      type: normalized,
      attendance,
      key: dialogKeyRef.current,
    })
  }, [])

  const clearDialogState = useCallback(() => {
    setDialogState(null)
  }, [])

  const value = useMemo(
    () => ({
      creatingType: dialogState?.type ?? PrismaAttendanceType.EVALUATION,
      editingAttendance: dialogState?.attendance ?? null,
      openNew,
      openEdit,
      handleSearch,
      handlePageChange,
      handleSortChange,
      dialogState,
      clearDialogState,
    }),
    [
      dialogState,
      openNew,
      openEdit,
      handleSearch,
      handlePageChange,
      handleSortChange,
      clearDialogState,
    ],
  )

  return (
    <AttendancesUiContext.Provider value={value}>
      <ModalProvider>
        {children}
        <AttendancesModalBridge />
      </ModalProvider>
    </AttendancesUiContext.Provider>
  )
}

const AttendancesModalBridge = () => {
  const ui = useContext(AttendancesUiContext)
  const { openModal } = useModalContext<
    Record<string, unknown>,
    { type: AttendanceType; attendance: Attendance | null }
  >()

  useEffect(() => {
    if (!ui?.dialogState) return
    openModal(
      { modal: AttendanceDialog, dontReplaceIfOpen: true, onHide: ui.clearDialogState },
      {
        type: ui.dialogState.type,
        attendance: ui.dialogState.attendance,
      },
    )
  }, [openModal, ui?.dialogState?.key])

  return null
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
