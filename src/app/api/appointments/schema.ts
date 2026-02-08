import { z } from "zod";
import { Status } from "@prisma/client";

const statusValues = ["confirmed", "canceled", "waiting", "rescheduled"] as const;
const statusMap: Record<(typeof statusValues)[number], Status> = {
  confirmed: Status.CONFIRMED,
  canceled: Status.CANCELED,
  waiting: Status.WAITING,
  rescheduled: Status.RESCHEDULED,
};
const lowerStatusSchema = z
  .string()
  .transform((value) => value.toLowerCase())
  .refine((value) => statusValues.includes(value as (typeof statusValues)[number]), {
    message: "Status inválido",
  });
const statusSchema = z
  .union([z.nativeEnum(Status), lowerStatusSchema])
  .transform((value) => {
    if (typeof value === "string") {
      return statusMap[value as (typeof statusValues)[number]];
    }
    return value;
  });

export const createAppointmentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  date: z.string().datetime("Data inválida"),
  status: statusSchema.optional(),
  notes: z.string().optional().or(z.literal("")).nullable(),
  patientId: z
    .string({
      required_error: "Paciente é obrigatório",
    })
    .cuid("Paciente inválido"),
  professionalId: z.string().min(1, "ID do profissional é obrigatório"),
});

export const normalizeAppointmentStatus = (
  value?: Status | string | null
): Status | undefined => {
  if (!value) return undefined
  const key = String(value).toUpperCase()
  if (key in Status) {
    return key as Status
  }
  const lower = String(value).toLowerCase()
  return statusMap[lower as (typeof statusValues)[number]]
}

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const appointmentParamsSchema = z.object({
  id: z.string().cuid("ID do agendamento inválido"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
