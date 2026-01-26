import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import {
  createApiError,
  createApiResponse,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils"
import {
  fetchStripeCustomer,
  getStripeEnvironment,
  listStripePaymentMethods,
  updateStripeDefaultPaymentMethod,
} from "@/lib/stripe"
import type { BillingPaymentMethod } from "@/types/billing"

const updateDefaultSchema = z.object({
  paymentMethodId: z.string().min(1, "Informe o ID do cartão"),
})

const toBillingPaymentMethod = (
  paymentMethod: Awaited<ReturnType<typeof listStripePaymentMethods>>["data"][number],
  defaultPaymentMethodId?: string | null,
): BillingPaymentMethod => ({
  id: paymentMethod.id,
  brand: paymentMethod.card?.brand || "card",
  last4: paymentMethod.card?.last4 || "0000",
  expMonth: paymentMethod.card?.exp_month || 0,
  expYear: paymentMethod.card?.exp_year || 0,
  billingName: paymentMethod.billing_details?.name || null,
  isDefault: paymentMethod.id === defaultPaymentMethodId,
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const stripeConfig = getStripeEnvironment()
    const [customer, paymentMethods] = await Promise.all([
      fetchStripeCustomer(stripeConfig),
      listStripePaymentMethods(stripeConfig),
    ])

    const defaultPaymentMethodId =
      typeof customer.invoice_settings?.default_payment_method === "string"
        ? customer.invoice_settings?.default_payment_method
        : customer.invoice_settings?.default_payment_method?.id

    const methods = paymentMethods.data.map((paymentMethod) =>
      toBillingPaymentMethod(paymentMethod, defaultPaymentMethodId),
    )

    return NextResponse.json(
      createApiResponse(methods, "Métodos de pagamento sincronizados"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const { paymentMethodId } = await validateJsonBody(request, updateDefaultSchema)

    const stripeConfig = getStripeEnvironment()
    await updateStripeDefaultPaymentMethod(stripeConfig, paymentMethodId)

    return NextResponse.json(
      createApiResponse({ updated: true }, "Cartão padrão atualizado com sucesso"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
