"use client"

import { z } from "zod"

export const checkoutSchema = z.object({
  cardHolder: z.string().min(3, "Informe o nome completo").optional(),
  coupon: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Você precisa aceitar os termos de uso" }),
  }),
  useSavedCard: z.boolean().default(false),
  savedPaymentMethodId: z.string().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
