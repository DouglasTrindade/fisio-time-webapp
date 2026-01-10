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
import type { AppointmentPayload } from "@/app/(protected)/agendamentos/_components/Fields/schema"
import { createCrudContext } from "@/contexts/crud/createCrudContext"
import { appointmentsCrudConfig } from "@/app/(protected)/agendamentos/_components/config"
import { useRecords } from "@/app/hooks/useRecords"

interface AppointmentsUiContextValue {
  calendarAppointments: Appointment[]
  isCalendarLoading: boolean
  selectedDate: Date | null
  isDialogOpen: boolean
  editingAppointment: Appointment | null
  handleDateSelect: (date: Date) => void
  openNew: (date?: Date | null) => void
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

const AppointmentsUiProvider = ({ children }: { children: ReactNode }) => {
  const { records, isFetching } = useCrud()
  const {
    records: calendarAppointments,
    isLoading: isCalendarLoading,
  } = useRecords<Appointment>(appointmentsCrudConfig.endpoint, {
    page: 1,
    limit: 100,
    sortBy: "date",
    sortOrder: "asc",
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    setEditingAppointment(null)
    setIsDialogOpen(false)
  }, [])

  const openNew = useCallback((date?: Date | null) => {
    if (date) {
      setSelectedDate(date)
    }
    setEditingAppointment(null)
    setIsDialogOpen(true)
  }, [])

  const openEdit = useCallback((appointment: Appointment) => {
    setEditingAppointment(appointment)
    setSelectedDate(new Date(appointment.date))
    setIsDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingAppointment(null)
  }, [])

  const value = useMemo(
    () => ({
      calendarAppointments,
      isCalendarLoading,
      selectedDate,
      isDialogOpen,
      editingAppointment,
      handleDateSelect,
      openNew,
      openEdit,
      closeDialog,
    }),
    [
      calendarAppointments,
      isCalendarLoading,
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
