import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import { createApiError, createApiResponse, handleApiError } from "@/lib/api/utils"
import { fetchWorkspaceSubscriptionSummary } from "@/lib/billing/subscription"
import type { BillingSummary } from "@/types/billing"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const summary = await fetchWorkspaceSubscriptionSummary()

    if (!summary.subscriptionId) {
      const emptySummary: BillingSummary = {
        planId: "custom",
        planName: "Sem assinatura",
        amount: 0,
        currency: "brl",
        status: "inactive",
        cancelAtPeriodEnd: false,
      }

      return NextResponse.json(createApiResponse(emptySummary))
    }

    return NextResponse.json(
      createApiResponse(summary, "Assinatura atual sincronizada com sucesso"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
