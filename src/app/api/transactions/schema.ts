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

const revenueCategorySchema = z.enum(["attendance", "deposit"])
const kindSchema = z.enum(["income", "expense"])

export const createTransactionSchema = z
  .object({
    description: z.string().min(2, "Descrição obrigatória"),
    amount: z
      .union([z.string(), z.number()])
      .transform((value) => (typeof value === "number" ? value.toString() : value))
      .refine((value) => !!value && !Number.isNaN(Number(value)), {
        message: "Valor inválido",
      }),
    account: optionalText,
    category: revenueCategorySchema.optional(),
    expenseCategory: optionalText,
    kind: kindSchema.default("income"),
    paymentMethod: z.enum(["pix", "bank_slip", "credit_card"]).optional(),
    dueDate: z.string().min(1, "Data de vencimento obrigatória"),
    competenceDate: z.string().min(1, "Data de competência obrigatória"),
    isPaid: z.boolean().default(false),
    notes: optionalText,
  })
  .superRefine((data, ctx) => {
    if (data.kind === "income" && !data.category) {
      ctx.addIssue({
        path: ["category"],
        code: "custom",
        message: "Selecione a categoria da receita",
      })
    }

    if (data.kind === "expense" && !normalizeString(data.expenseCategory)) {
      ctx.addIssue({
        path: ["expenseCategory"],
        code: "custom",
        message: "Informe a categoria da despesa",
      })
    }
  })

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
