import { z } from "zod";
import { Status } from "@prisma/client";

export const appointmentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  date: z.string().datetime("Data inválida"),
  status: z.nativeEnum(Status).default("waiting"),
  patientId: z.string().cuid("ID do paciente inválido").optional().nullable(),
  notes: z.string().optional().or(z.literal("")).nullable(),
  professionalId: z.string().cuid("ID do profissional inválido"),
});

export type AppointmentForm = z.infer<typeof appointmentSchema>;
