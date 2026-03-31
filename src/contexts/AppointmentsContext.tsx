"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"
import type { Appointment, AppointmentFilters } from "@/types/appointment"
import type { AppointmentPayload } from "@/app/(protected)/agendamentos/_components/Fields/schema"
import { createCrudContext } from "@/contexts/crud/createCrudContext"
import { appointmentsCrudConfig } from "@/app/(protected)/agendamentos/_components/config"
import { useRecords } from "@/hooks/useRecords"
import { ModalProvider, useModalContext } from "@/contexts/ModalContext"
import { AppointmentsModal } from "@/app/(protected)/agendamentos/_components/Modal"

interface AppointmentsUiContextValue {
  calendarAppointments: Appointment[]
  isCalendarLoading: boolean
  selectedDate: Date | null
  handleDateSelect: (date: Date) => void
  openNew: (date?: Date | null) => void
  openEdit: (appointment: Appointment) => void
  clearDialogState: () => void
  dialogState: {
    appointment: Appointment | null
    initialDate?: string
    key: number
  } | null
}

const { CrudProvider, useCrud } = createCrudContext<
  Appointment,
  AppointmentPayload,
  Partial<AppointmentPayload>,
  AppointmentFilters & Record<string, unknown>
>(appointmentsCrudConfig)

const AppointmentsUiContext = createContext<AppointmentsUiContextValue | null>(null)

const AppointmentsUiProvider = ({ children }: { children: ReactNode }) => {
  const { records, isFetching } = useCrud()
  const calendarQuery = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sortBy: "date",
      sortOrder: "asc",
    }),
    [],
  )

  const {
    records: calendarAppointments,
    isLoading: isCalendarLoading,
  } = useRecords<Appointment>(appointmentsCrudConfig.endpoint, calendarQuery)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogState, setDialogState] = useState<{
    appointment: Appointment | null
    initialDate?: string
    key: number
  } | null>(null)
  const dialogKeyRef = useRef(0)

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const openNew = useCallback(
    (date?: Date | null) => {
      const nextDate = date ?? selectedDate
      if (nextDate) {
        setSelectedDate(nextDate)
      }
      dialogKeyRef.current += 1
      setDialogState({
        appointment: null,
        initialDate: nextDate ? nextDate.toISOString() : undefined,
        key: dialogKeyRef.current,
      })
    },
    [selectedDate],
  )

  const openEdit = useCallback((appointment: Appointment) => {
    const date = new Date(appointment.date)
    setSelectedDate(date)
    dialogKeyRef.current += 1
    setDialogState({
      appointment,
      initialDate: appointment.date,
      key: dialogKeyRef.current,
    })
  }, [])

  const clearDialogState = useCallback(() => {
    setDialogState(null)
  }, [])

  const value = useMemo(
    () => ({
      calendarAppointments,
      isCalendarLoading,
      selectedDate,
      dialogState,
      handleDateSelect,
      openNew,
      openEdit,
      clearDialogState,
    }),
    [
      calendarAppointments,
      isCalendarLoading,
      selectedDate,
      dialogState,
      handleDateSelect,
      openNew,
      openEdit,
      clearDialogState,
    ],
  )

  return (
    <AppointmentsUiContext.Provider value={value}>
      <ModalProvider>
        {children}
        <AppointmentsModalBridge />
      </ModalProvider>
    </AppointmentsUiContext.Provider>
  )
}

const AppointmentsModalBridge = () => {
  const ui = useContext(AppointmentsUiContext)
  const { openModal } = useModalContext<
    Record<string, unknown>,
    { appointment?: Appointment | null; initialDate?: string }
  >()

  useEffect(() => {
    if (!ui?.dialogState) return
    openModal(
      { modal: AppointmentsModal, dontReplaceIfOpen: true, onHide: ui.clearDialogState },
      {
        appointment: ui.dialogState.appointment,
        initialDate: ui.dialogState.initialDate,
      },
    )
  }, [openModal, ui?.dialogState?.key])

  return null
}

export const AppointmentsProvider = ({ children }: { children: ReactNode }) => (
  <CrudProvider>
    <AppointmentsUiProvider>{children}</AppointmentsUiProvider>
  </CrudProvider>
)

export const useAppointmentsContext = () => {
  const crud = useCrud()
  const ui = useContext(AppointmentsUiContext)
  if (!ui) {
    throw new Error("useAppointmentsContext must be used within AppointmentsProvider")
  }
  return { ...crud, ...ui }
}
