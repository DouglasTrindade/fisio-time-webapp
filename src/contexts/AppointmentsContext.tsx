"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import type { Appointment, AppointmentFilters } from "@/app/types/appointment"
import type { AppointmentPayload } from "@/app/(protected)/agendamentos/_components/schema"
import { createCrudContext } from "@/contexts/crud/createCrudContext"
import { appointmentsCrudConfig } from "@/app/(protected)/agendamentos/_components/config"

interface AppointmentsUiContextValue {
  calendarAppointments: Appointment[]
  isCalendarLoading: boolean
  selectedDate: Date | null
  isDialogOpen: boolean
  editingAppointment: Appointment | null
  handleDateSelect: (date: Date) => void
  openNew: () => void
  openEdit: (appointment: Appointment) => void
  closeDialog: () => void
}

const { CrudProvider, useCrud } = createCrudContext<
  Appointment,
  AppointmentPayload,
  Partial<AppointmentPayload>,
  AppointmentFilters & Record<string, unknown>
>(appointmentsCrudConfig)

const AppointmentsUiContext = createContext<AppointmentsUiContextValue | null>(null)

const toQueryDate = (date: Date | null) => {
  if (!date) return undefined
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return adjusted.toISOString().slice(0, 10)
}

const AppointmentsUiProvider = ({ children }: { children: ReactNode }) => {
  const { setFilters, records, isFetching } = useCrud()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  const syncDateFilter = useCallback((date: Date | null) => {
    setSelectedDate(date)
    const queryDate = toQueryDate(date)
    setFilters((prev) => ({ ...prev, date: queryDate }))
  }, [setFilters])

  const handleDateSelect = useCallback((date: Date) => {
    syncDateFilter(date)
    setEditingAppointment(null)
    setIsDialogOpen(false)
  }, [syncDateFilter])

  const openNew = useCallback(() => {
    syncDateFilter(null)
    setEditingAppointment(null)
    setIsDialogOpen(true)
  }, [syncDateFilter])

  const openEdit = useCallback((appointment: Appointment) => {
    setEditingAppointment(appointment)
    syncDateFilter(new Date(appointment.date))
    setIsDialogOpen(true)
  }, [syncDateFilter])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingAppointment(null)
  }, [])

  const value = useMemo(
    () => ({
      calendarAppointments: records,
      isCalendarLoading: isFetching,
      selectedDate,
      isDialogOpen,
      editingAppointment,
      handleDateSelect,
      openNew,
      openEdit,
      closeDialog,
    }),
    [
      records,
      isFetching,
      selectedDate,
      isDialogOpen,
      editingAppointment,
      handleDateSelect,
      openNew,
      openEdit,
      closeDialog,
    ]
  )

  return (
    <AppointmentsUiContext.Provider value={value}>
      {children}
    </AppointmentsUiContext.Provider>
  )
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
