import { z } from "zod";
import { Status } from "@prisma/client";

export const appointmentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  date: z.string().datetime("Data inválida"),
  status: z.nativeEnum(Status).default(Status.WAITING),
  patientId: z.string().nullable().optional(),
  notes: z.string().optional().or(z.literal("")).nullable(),
  professionalId: z.string().min(1, "ID do profissional é obrigatório"),
});

export type AppointmentForm = z.infer<typeof appointmentSchema>;
