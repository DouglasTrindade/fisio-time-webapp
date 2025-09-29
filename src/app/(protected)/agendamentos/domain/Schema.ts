import { z } from "zod";
import { Status } from "@prisma/client";

export const appointmentSchema = z.object({
  name: z.string(),
  phone: z.string().min(1, "Telefone é obrigatório"),
  date: z.string().datetime("Data inválida"),
  status: z.nativeEnum(Status),
  patientId: z.string().min(1, "Paciente é obrigatório"),
  notes: z.string().nullable().optional(),
  professionalId: z.string().cuid("Profissional inválido"),
});

export type AppointmentForm = z.infer<typeof appointmentSchema>;
