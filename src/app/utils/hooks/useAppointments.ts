import {
  useRecords,
  useRecord,
  useCreateRecord,
  useUpdateRecord,
  useDeleteRecord,
} from "./useRecords";
import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentFilters,
} from "@/app/utils/types/appointment";

const endpoint = "/appointments";

export const useAppointments = (filters: AppointmentFilters = {}) =>
  useRecords<Appointment, AppointmentFilters>(endpoint, filters);

export const useAppointment = (id: string) =>
  useRecord<Appointment>(endpoint, id);

export const useCreateAppointment = () =>
  useCreateRecord<AppointmentCreateInput>(endpoint);

export const useUpdateAppointment = () =>
  useUpdateRecord<Partial<AppointmentCreateInput>>(endpoint);

export const useDeleteAppointment = () => useDeleteRecord(endpoint);
