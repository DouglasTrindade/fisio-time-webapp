import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import {
  attachStripePaymentMethod,
  createStripeSubscription,
  confirmStripePaymentIntent,
  fetchStripeInvoice,
  fetchStripePaymentIntent,
  fetchStripeSubscription,
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

export async function POST(request: NextRequest) {
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

    let subscription = await createStripeSubscription(stripeConfig, priceId, paymentMethodId, coupon)
    let paymentIntentClientSecret: string | undefined
    let paymentIntentStatus: string | undefined
    let invoiceId: string | undefined

    if (subscription.latest_invoice) {
      invoiceId =
        typeof subscription.latest_invoice === "string"
          ? subscription.latest_invoice
          : subscription.latest_invoice.id

      if (invoiceId) {
        const invoice =
          typeof subscription.latest_invoice === "object" &&
          subscription.latest_invoice.payment_intent
            ? subscription.latest_invoice
            : await fetchStripeInvoice(stripeConfig, invoiceId)

        const paymentIntentRef = invoice.payment_intent
        if (paymentIntentRef) {
          const resolveIntent = async (intentId: string, clientSecret?: string | null, status?: string) => {
            let currentClientSecret = clientSecret ?? undefined
            let currentStatus = status
            if (
              !currentStatus ||
              currentStatus === "requires_payment_method" ||
              currentStatus === "requires_confirmation"
            ) {
              const confirmed = await confirmStripePaymentIntent(stripeConfig, intentId, {
                off_session: "true",
                payment_method: paymentMethodId,
              })
              currentClientSecret = confirmed.client_secret ?? currentClientSecret
              currentStatus = confirmed.status
            }

            paymentIntentClientSecret = currentClientSecret ?? undefined
            paymentIntentStatus = currentStatus
            if (paymentIntentStatus === "succeeded") {
              paymentIntentClientSecret = undefined
            }
          }

          if (typeof paymentIntentRef === "string") {
            const paymentIntent = await fetchStripePaymentIntent(stripeConfig, paymentIntentRef)
            await resolveIntent(
              paymentIntent.id,
              paymentIntent.client_secret,
              paymentIntent.status,
            )
          } else if (paymentIntentRef.id) {
            await resolveIntent(
              paymentIntentRef.id,
              paymentIntentRef.client_secret,
              paymentIntentRef.status,
            )
          }
        }
      }
    }

    if (paymentIntentStatus === "succeeded" && invoiceId) {
      try {
        await payStripeInvoice(stripeConfig, invoiceId, paymentMethodId)
      } catch (error) {
        console.error("Falha ao confirmar pagamento da fatura:", error)
      }
      subscription = await fetchStripeSubscription(stripeConfig, subscription.id)
    }

    return NextResponse.json(
      createApiResponse(
        {
          subscriptionId: subscription.id,
          status: subscription.status,
          paymentIntentClientSecret,
          paymentIntentStatus,
          invoiceId,
        },
        "Assinatura criada com sucesso",
      ),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
