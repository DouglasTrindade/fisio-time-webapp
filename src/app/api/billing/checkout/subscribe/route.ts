import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import {
  attachStripePaymentMethod,
  createStripeSubscription,
  getStripeEnvironment,
  payStripeInvoice,
  updateStripeDefaultPaymentMethod,
} from "@/lib/stripe"
import { createApiError, createApiResponse, handleApiError, validateJsonBody } from "@/lib/api/utils"

const subscribeSchema = z.object({
  planId: z.enum(["professional", "team", "clinic"]),
  paymentMethodId: z.string().min(1, "Informe o método de pagamento"),
  coupon: z.string().optional(),
})

const planPriceMap: Record<string, string | undefined> = {
  professional: process.env.STRIPE_PRICE_ID_PROFESSIONAL,
  team: process.env.STRIPE_PRICE_ID_TEAM,
  clinic: process.env.STRIPE_PRICE_ID_CLINIC,
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const { planId, paymentMethodId, coupon } = await validateJsonBody(request, subscribeSchema)
    const priceId = planPriceMap[planId]

    if (!priceId) {
      return NextResponse.json(
        createApiError("Plano não configurado", "Informe o price ID correspondente no ambiente"),
        { status: 400 },
      )
    }

    const stripeConfig = getStripeEnvironment()

    await attachStripePaymentMethod(stripeConfig, paymentMethodId)
    await updateStripeDefaultPaymentMethod(stripeConfig, paymentMethodId)

    const subscription = await createStripeSubscription(stripeConfig, priceId, paymentMethodId, coupon)
    const latestInvoiceId = typeof subscription.latest_invoice === "object"
      ? subscription.latest_invoice.id
      : subscription.latest_invoice

    if (latestInvoiceId) {
      try {
        await payStripeInvoice(stripeConfig, latestInvoiceId)
      } catch (invoiceError) {
        console.error("Falha ao confirmar a fatura automaticamente", invoiceError)
      }
    }

    return NextResponse.json(
      createApiResponse(
        { subscriptionId: subscription.id, status: subscription.status },
        "Assinatura criada com sucesso",
      ),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
