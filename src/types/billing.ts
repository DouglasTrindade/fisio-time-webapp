export type SubscriptionPlanId = "professional" | "team" | "clinic" | "custom"

export interface SubscriptionPlan {
  id: SubscriptionPlanId
  name: string
  description: string
  price: number
  features: string[]
  highlight?: string
  limits?: string[]
  addOns?: string[]
  badge?: string
}

export interface BillingSummary {
  subscriptionId?: string
  planId: SubscriptionPlanId
  planName: string
  amount: number
  currency: string
  status: string
  periodEndsAt?: string
  cancelAtPeriodEnd: boolean
  trialEndsAt?: string
}

export interface BillingPaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  billingName?: string | null
  isDefault: boolean
}

export interface BillingInvoice {
  id: string
  reference: string
  status: string
  currency: string
  amount: number
  createdAt: string
  hostedInvoiceUrl?: string | null
}
