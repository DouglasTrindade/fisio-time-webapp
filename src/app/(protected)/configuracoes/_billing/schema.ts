"use client"

import { z } from "zod"

export const addCardSchema = z.object({
  cardHolder: z.string().min(3, "Informe o nome completo"),
  saveCard: z.boolean(),
  setAsDefault: z.boolean(),
})

export type AddCardFormValues = z.infer<typeof addCardSchema>

export const editCardSchema = z.object({
  billingName: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length >= 3, {
      message: "Informe pelo menos 3 caracteres",
    }),
  setAsDefault: z.boolean(),
})

export type EditCardFormValues = z.infer<typeof editCardSchema>
