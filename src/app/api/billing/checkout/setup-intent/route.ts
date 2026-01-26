import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import { createApiError, createApiResponse, handleApiError } from "@/lib/api/utils"
import { createStripeSetupIntent, getStripeEnvironment } from "@/lib/stripe"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const stripeConfig = getStripeEnvironment()
    const setupIntent = await createStripeSetupIntent(stripeConfig)

    if (!setupIntent.client_secret) {
      throw new Error("Stripe não retornou o client_secret do SetupIntent")
    }

    return NextResponse.json(
      createApiResponse({ clientSecret: setupIntent.client_secret }, "SetupIntent criado"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
