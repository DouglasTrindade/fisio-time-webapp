import { z } from "zod";
import { Status } from "@prisma/client";

export const createAppointmentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  date: z.string().datetime("Data inválida"),
  status: z.nativeEnum(Status).optional(),
  notes: z.string().optional().or(z.literal("")).nullable(),
  patientId: z.string().nullable().optional(),
  professionalId: z.string().nullable().optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const appointmentParamsSchema = z.object({
  id: z.string().cuid("ID do agendamento inválido"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
