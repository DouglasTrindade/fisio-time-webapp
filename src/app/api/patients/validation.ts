import { z } from "zod"

export const createPatientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  birthDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
    z.string().datetime(),
    z.date(),
    z.null(),
    z.literal("")
  ]).transform(val => {
    if (!val || val === "") return null;
    if (val instanceof Date) return val;
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(val + "T12:00:00.000Z");
    }
    return new Date(val);
  }).nullable().optional(),
  notes: z.string().optional().or(z.literal("")),
})

export const updatePatientSchema = createPatientSchema.partial()

export const patientParamsSchema = z.object({
  id: z.string().cuid("ID inválido"),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
