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
  cpf: z.string().optional().or(z.literal("")),
  rg: z.string().optional().or(z.literal("")),
  maritalStatus: z.enum(["solteiro", "casado", "viuva", "divorciado", "separado"]).optional().or(z.literal("")),
  gender: z.enum(["masculino", "feminino"]).optional().or(z.literal("")),
  profession: z.string().optional().or(z.literal("")),
  companyName: z.string().optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
})

export const updatePatientSchema = createPatientSchema.partial()

export const patientParamsSchema = z.object({
  id: z.string().cuid("ID inválido"),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
