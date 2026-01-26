import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import { createApiError, createApiResponse, handleApiError } from "@/lib/api/utils"
import { getStripeEnvironment, listStripeSubscriptions } from "@/lib/stripe"
import type { BillingSummary, SubscriptionPlanId } from "@/types/billing"

const ACTIVE_STATUSES = ["trialing", "active", "past_due", "unpaid"]
const PRICE_PLAN_MAP: Record<
  string,
  { id: SubscriptionPlanId; name: string }
> = {
  [process.env.STRIPE_PRICE_ID_PROFESSIONAL ?? ""]: {
    id: "professional",
    name: "Plano Profissional",
  },
  [process.env.STRIPE_PRICE_ID_TEAM ?? ""]: {
    id: "team",
    name: "Plano Equipe",
  },
  [process.env.STRIPE_PRICE_ID_CLINIC ?? ""]: {
    id: "clinic",
    name: "Plano Clínica",
  },
}

const normalizePlanId = (planId?: string | null): SubscriptionPlanId => {
  if (!planId) return "custom"
  if (planId === "professional" || planId === "team" || planId === "clinic") {
    return planId
  }
  return "custom"
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const stripeConfig = getStripeEnvironment()
    const subscriptions = await listStripeSubscriptions(stripeConfig)

    const activeSubscription =
      subscriptions.data.find((subscription) => ACTIVE_STATUSES.includes(subscription.status)) ||
      subscriptions.data[0]

    if (!activeSubscription) {
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

    const plan = activeSubscription.items.data[0]?.plan
    const hasPeriodEnd =
      typeof activeSubscription.current_period_end === "number" &&
      Number.isFinite(activeSubscription.current_period_end) &&
      activeSubscription.current_period_end > 0
    const hasTrialEnd =
      typeof activeSubscription.trial_end === "number" &&
      Number.isFinite(activeSubscription.trial_end) &&
      activeSubscription.trial_end > 0

    const priceMetadataPlanId = plan?.metadata?.plan_id || plan?.metadata?.app_plan_id
    const mappedPlan = plan?.id ? PRICE_PLAN_MAP[plan.id] : undefined
    const resolvedPlanId = normalizePlanId(priceMetadataPlanId || mappedPlan?.id)
    const summary: BillingSummary = {
      planId: resolvedPlanId,
      planName: plan?.nickname || plan?.metadata?.plan_name || mappedPlan?.name || "Plano atual",
      amount: (plan?.amount ?? 0) / 100,
      currency: plan?.currency || "brl",
      status: activeSubscription.status,
      periodEndsAt: hasPeriodEnd
        ? new Date(activeSubscription.current_period_end * 1000).toISOString()
        : undefined,
      cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
      trialEndsAt: hasTrialEnd ? new Date(activeSubscription.trial_end * 1000).toISOString() : undefined,
    }

    return NextResponse.json(
      createApiResponse(summary, "Assinatura atual sincronizada com sucesso"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
