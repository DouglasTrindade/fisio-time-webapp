import { z } from "zod";

export const appointmentStatusEnum = z.enum([
  "waiting",
  "attended",
  "confirmed",
  "canceled",
  "rescheduled",
]);

export const createAppointmentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  date: z.string().datetime("Data inválida"),
  status: appointmentStatusEnum.optional(),
  notes: z.string().optional().or(z.literal("")).nullable(),
  patientId: z.string().cuid("ID do paciente inválido").optional().nullable(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const appointmentParamsSchema = z.object({
  id: z.string().cuid("ID do agendamento inválido"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
