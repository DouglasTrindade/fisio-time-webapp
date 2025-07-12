import { z } from "zod";

export const createAppointmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  date: z.string().datetime("Data inválida"),
  status: z.enum(["waiting", "attended"]).optional(),
  notes: z.string().optional(),
  patientId: z.string().optional(),
});
