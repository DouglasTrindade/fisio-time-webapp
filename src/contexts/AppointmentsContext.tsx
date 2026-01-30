"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import type { Appointment, AppointmentFilters } from "@/types/appointment"
import type { AppointmentPayload } from "@/app/(protected)/agendamentos/_components/Fields/schema"
import { createCrudContext } from "@/contexts/crud/createCrudContext"
import { appointmentsCrudConfig } from "@/app/(protected)/agendamentos/_components/config"
import { useRecords } from "@/hooks/useRecords"

interface AppointmentsUiContextValue {
  calendarAppointments: Appointment[]
  isCalendarLoading: boolean
  selectedDate: Date | null
  handleDateSelect: (date: Date) => void
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

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const value = useMemo(
    () => ({
      calendarAppointments,
      isCalendarLoading,
      selectedDate,
      handleDateSelect,
    }),
    [
      calendarAppointments,
      isCalendarLoading,
      selectedDate,
      handleDateSelect,
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
