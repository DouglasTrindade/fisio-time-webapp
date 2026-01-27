import { getStripeEnvironment, listStripeSubscriptions, type StripeSubscription } from "@/lib/stripe"
import type { BillingSummary, SubscriptionPlanId } from "@/types/billing"

export const ACTIVE_SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "unpaid",
] as const

const PLAN_PRICE_MAP: Record<string, { id: SubscriptionPlanId; name: string }> = {
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

const normalizePlanId = (raw?: string | null): SubscriptionPlanId => {
  if (!raw) return "custom"
  if (raw === "professional" || raw === "team" || raw === "clinic") {
    return raw
  }
  return "custom"
}

const DEFAULT_SUMMARY: BillingSummary = {
  planId: "custom",
  planName: "Sem assinatura",
  amount: 0,
  currency: "brl",
  status: "inactive",
  cancelAtPeriodEnd: false,
}

const mapSubscriptionToSummary = (subscription?: StripeSubscription): BillingSummary => {
  if (!subscription) {
    return DEFAULT_SUMMARY
  }

  const plan = subscription.items.data[0]?.plan
  const hasPeriodEnd =
    typeof subscription.current_period_end === "number" &&
    Number.isFinite(subscription.current_period_end) &&
    subscription.current_period_end > 0
  const hasTrialEnd =
    typeof subscription.trial_end === "number" &&
    Number.isFinite(subscription.trial_end) &&
    subscription.trial_end > 0

  const priceMetadataPlanId = plan?.metadata?.plan_id || plan?.metadata?.app_plan_id
  const mappedPlan = plan?.id ? PLAN_PRICE_MAP[plan.id] : undefined
  const resolvedPlanId = normalizePlanId(priceMetadataPlanId || mappedPlan?.id)

  return {
    subscriptionId: subscription.id,
    planId: resolvedPlanId,
    planName: plan?.nickname || plan?.metadata?.plan_name || mappedPlan?.name || "Plano atual",
    amount: (plan?.amount ?? 0) / 100,
    currency: plan?.currency || "brl",
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    periodEndsAt: hasPeriodEnd
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : undefined,
    trialEndsAt: hasTrialEnd ? new Date(subscription.trial_end * 1000).toISOString() : undefined,
  }
}

export const fetchWorkspaceSubscriptionSummary = async (): Promise<BillingSummary> => {
  const stripeConfig = getStripeEnvironment()
  const subscriptions = await listStripeSubscriptions(stripeConfig)

  const activeSubscription =
    subscriptions.data.find((subscription) =>
      ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number]),
    ) || subscriptions.data[0]

  return mapSubscriptionToSummary(activeSubscription)
}

export const hasActiveWorkspaceSubscription = async () => {
  const summary = await fetchWorkspaceSubscriptionSummary()
  return summary.status !== "inactive"
}
