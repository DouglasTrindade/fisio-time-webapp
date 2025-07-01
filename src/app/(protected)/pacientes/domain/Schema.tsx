import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  phone: z.string().min(8, "Telefone obrigatório"),
  email: z.string().email("Email inválido").optional(),
});

export type PatientSchema = z.infer<typeof patientSchema>;
