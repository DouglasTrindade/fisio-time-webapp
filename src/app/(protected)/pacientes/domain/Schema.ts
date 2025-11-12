import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  birthDate: z.string().nullable().optional(),
  notes: z.string().optional(),
});

export type PatientSchema = z.infer<typeof patientSchema>;