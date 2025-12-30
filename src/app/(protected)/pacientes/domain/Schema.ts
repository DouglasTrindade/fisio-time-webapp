import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  birthDate: z.string().nullable().optional(),
  notes: z.string().optional(),
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
});

export type PatientSchema = z.infer<typeof patientSchema>;
