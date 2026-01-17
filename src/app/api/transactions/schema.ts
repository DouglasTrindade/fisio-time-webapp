import { z } from "zod"

const optionalText = z
  .string()
  .optional()
  .or(z.literal(""))

const normalizeString = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export const createTransactionSchema = z.object({
  description: z.string().min(2, "Descrição obrigatória"),
  amount: z
    .union([z.string(), z.number()])
    .transform((value) => (typeof value === "number" ? value.toString() : value))
    .refine((value) => !!value && !Number.isNaN(Number(value)), {
      message: "Valor inválido",
    }),
  account: optionalText,
  category: z.enum(["attendance", "deposit"]),
  paymentMethod: z.enum(["pix", "bank_slip", "credit_card"]).optional(),
  dueDate: z.string().min(1, "Data de vencimento obrigatória"),
  competenceDate: z.string().min(1, "Data de competência obrigatória"),
  isPaid: z.boolean().default(false),
  notes: optionalText,
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
