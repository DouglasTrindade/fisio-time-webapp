import { z } from "zod"

export const createPatientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  birthDate: z.string().datetime().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export const updatePatientSchema = createPatientSchema.partial()

export const patientParamsSchema = z.object({
  id: z.string().cuid("ID inválido"),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
