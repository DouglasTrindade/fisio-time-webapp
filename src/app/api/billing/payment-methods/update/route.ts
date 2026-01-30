import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import { createApiError, createApiResponse, handleApiError, validateJsonBody } from "@/lib/api/utils"
import {
  getStripeEnvironment,
  updateStripeDefaultPaymentMethod,
  updateStripePaymentMethodDetails,
} from "@/lib/stripe"

const updateSchema = z.object({
  paymentMethodId: z.string().min(1, "Informe o cartão"),
  billingName: z
    .string()
    .max(80, "Nome muito longo")
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine((value) => !value || value.length >= 3, {
      message: "Informe pelo menos 3 caracteres",
    }),
  setAsDefault: z.boolean().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const { paymentMethodId, billingName, setAsDefault } = await validateJsonBody(
      request,
      updateSchema,
    )

    if (!billingName && !setAsDefault) {
      return NextResponse.json(createApiError("Nenhuma alteração informada"), { status: 400 })
    }

    const stripeConfig = getStripeEnvironment()

    if (billingName) {
      await updateStripePaymentMethodDetails(stripeConfig, paymentMethodId, { billingName })
    }

    if (setAsDefault) {
      await updateStripeDefaultPaymentMethod(stripeConfig, paymentMethodId)
    }

    return NextResponse.json(
      createApiResponse({ updated: true }, "Cartão atualizado com sucesso"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
