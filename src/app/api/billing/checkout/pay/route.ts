import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import { createApiError, createApiResponse, handleApiError, validateJsonBody } from "@/lib/api/utils"
import { getStripeEnvironment, payStripeInvoice } from "@/lib/stripe"

const schema = z.object({
  invoiceId: z.string().min(1, "Informe a fatura"),
  paymentMethodId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const { invoiceId, paymentMethodId } = await validateJsonBody(request, schema)
    const stripeConfig = getStripeEnvironment()
    const invoice = await payStripeInvoice(stripeConfig, invoiceId, paymentMethodId)

    return NextResponse.json(
      createApiResponse(
        {
          id: invoice.id,
          status: invoice.status,
        },
        "Fatura quitada",
      ),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
