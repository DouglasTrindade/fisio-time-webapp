import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import { createApiError, createApiResponse, handleApiError, validateJsonBody } from "@/lib/api/utils"
import { detachStripePaymentMethod, getStripeEnvironment } from "@/lib/stripe"

const schema = z.object({
  paymentMethodId: z.string().min(1, "Informe o método de pagamento"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const { paymentMethodId } = await validateJsonBody(request, schema)
    const stripeConfig = getStripeEnvironment()
    await detachStripePaymentMethod(stripeConfig, paymentMethodId)

    return NextResponse.json(createApiResponse({ detached: true }, "Cartão removido"))
  } catch (error) {
    return handleApiError(error)
  }
}
