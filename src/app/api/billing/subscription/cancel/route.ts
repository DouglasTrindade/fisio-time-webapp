import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import { createApiError, createApiResponse, handleApiError } from "@/lib/api/utils"
import { getStripeEnvironment, updateStripeSubscriptionCancellation } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const body = (await request.json()) as { subscriptionId?: string }
    if (!body.subscriptionId) {
      return NextResponse.json(createApiError("Assinatura não encontrada"), { status: 400 })
    }

    const stripeConfig = getStripeEnvironment()
    await updateStripeSubscriptionCancellation(stripeConfig, body.subscriptionId, true)

    return NextResponse.json(
      createApiResponse(null, "Assinatura cancelada ao término do ciclo atual"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
