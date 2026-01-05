"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { Appointment, AppointmentFilters } from "@/app/types/appointment"
import type { AppointmentPayload } from "@/app/(protected)/agendamentos/_components/schema"
import { createCrudContext } from "@/contexts/crud/createCrudContext"
import type { CrudContextValue } from "@/contexts/crud/types"
import { appointmentsCrudConfig } from "@/app/(protected)/agendamentos/_components/config"
import { useRecords } from "@/app/hooks/useRecords"

type AppointmentsCrudValue = CrudContextValue<
  Appointment,
  AppointmentPayload,
  Partial<AppointmentPayload>,
  AppointmentFilters
>

interface AppointmentsContextValue extends AppointmentsCrudValue {
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

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null)

const toQueryDate = (date: Date | null) => {
  if (!date) return undefined
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return adjusted.toISOString().slice(0, 10)
}

const AppointmentsProviderInner = ({ children }: { children: ReactNode }) => {
  const crud = useCrud()
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

  const syncDateFilter = (date: Date | null) => {
    setSelectedDate(date)
    const queryDate = toQueryDate(date)
    crud.setFilters((prev) => ({ ...prev, date: queryDate }))
  }

  const handleDateSelect = (date: Date) => {
    syncDateFilter(date)
    setEditingAppointment(null)
    setIsDialogOpen(false)
  }

  const openNew = () => {
    syncDateFilter(null)
    setEditingAppointment(null)
    setIsDialogOpen(true)
  }

  const openEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    syncDateFilter(new Date(appointment.date))
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingAppointment(null)
  }

  const value = useMemo(
    () => ({
      ...crud,
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
      crud,
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
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  )
}

export const AppointmentsProvider = ({ children }: { children: ReactNode }) => (
  <CrudProvider>
    <AppointmentsProviderInner>{children}</AppointmentsProviderInner>
  </CrudProvider>
)

export const useAppointmentsContext = () => {
  const context = useContext(AppointmentsContext)
  if (!context) {
    throw new Error("useAppointmentsContext must be used within AppointmentsProvider")
  }
  return context
}
