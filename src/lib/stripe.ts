const STRIPE_API_BASE = "https://api.stripe.com/v1"

export type StripeEnvironment = {
  secretKey: string
  customerId: string
}

type StripeListResponse<T> = {
  object: "list"
  data: T[]
}

type StripeCardDetails = {
  brand: string
  last4: string
  exp_month: number
  exp_year: number
}

export type StripePaymentMethod = {
  id: string
  object: string
  card?: StripeCardDetails
  billing_details?: {
    name?: string | null
  }
}

export type StripeCustomer = {
  id: string
  invoice_settings?: {
    default_payment_method?: string | StripePaymentMethod | null
  }
}

export type StripeInvoice = {
  id: string
  number?: string | null
  status?: string | null
  currency?: string | null
  amount_due?: number | null
  created?: number | null
  hosted_invoice_url?: string | null
  payment_intent?: string | StripePaymentIntent | null
}

export type StripeSubscription = {
  id: string
  status: string
  current_period_end: number
  trial_end?: number | null
  cancel_at_period_end: boolean
  latest_invoice?: string | (StripeInvoice & { payment_intent?: string | StripePaymentIntent | null }) | null
  items: {
    data: Array<{
      plan: {
        id: string
        nickname?: string | null
        product?: string | null
        currency?: string | null
        amount?: number | null
        metadata?: Record<string, string>
      }
    }>
  }
}

export type StripePaymentIntent = {
  id: string
  client_secret?: string | null
  status: string
}

export type StripeSetupIntent = {
  id: string
  client_secret?: string | null
  status: string
  payment_method?: string | null
}

const stripeError = (message: string, status?: number) => {
  const error = new Error(message) as Error & { status?: number }
  error.status = status
  return error
}

const stripeRequest = async <T>(config: StripeEnvironment, path: string, init?: RequestInit) => {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      ...init?.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const message = data?.error?.message || "Falha ao se comunicar com a API da Stripe"
    throw stripeError(message, response.status)
  }

  return data as T
}

export const getStripeEnvironment = (): StripeEnvironment => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const customerId = process.env.STRIPE_CUSTOMER_ID

  if (!secretKey || !customerId) {
    throw stripeError(
      "Stripe não configurado. Defina STRIPE_SECRET_KEY e STRIPE_CUSTOMER_ID no ambiente.",
      500,
    )
  }

  return { secretKey, customerId }
}

export const fetchStripeCustomer = (config: StripeEnvironment) =>
  stripeRequest<StripeCustomer>(config, `/customers/${config.customerId}`)

export const listStripePaymentMethods = (config: StripeEnvironment) => {
  const params = new URLSearchParams({
    customer: config.customerId,
    type: "card",
  })
  return stripeRequest<StripeListResponse<StripePaymentMethod>>(config, `/payment_methods?${params}`)
}

export const updateStripeDefaultPaymentMethod = (
  config: StripeEnvironment,
  paymentMethodId: string,
) => {
  const body = new URLSearchParams({
    "invoice_settings[default_payment_method]": paymentMethodId,
  })

  return stripeRequest<StripeCustomer>(config, `/customers/${config.customerId}`, {
    method: "POST",
    body,
  })
}

export const listStripeInvoices = (config: StripeEnvironment, limit = 12) => {
  const params = new URLSearchParams({
    customer: config.customerId,
    limit: limit.toString(),
  })
  return stripeRequest<StripeListResponse<StripeInvoice>>(config, `/invoices?${params}`)
}

export const listStripeSubscriptions = (config: StripeEnvironment) => {
  const params = new URLSearchParams({
    customer: config.customerId,
    status: "all",
    limit: "5",
  })
  return stripeRequest<StripeListResponse<StripeSubscription>>(config, `/subscriptions?${params}`)
}

export const createStripeSetupIntent = (config: StripeEnvironment) => {
  const body = new URLSearchParams({
    customer: config.customerId,
    usage: "off_session",
  })

  return stripeRequest<StripeSetupIntent>(config, `/setup_intents`, {
    method: "POST",
    body,
  })
}

export const attachStripePaymentMethod = (
  config: StripeEnvironment,
  paymentMethodId: string,
) => {
  const body = new URLSearchParams({
    customer: config.customerId,
  })

  return stripeRequest<StripePaymentMethod>(config, `/payment_methods/${paymentMethodId}/attach`, {
    method: "POST",
    body,
  })
}

export const createStripeSubscription = (
  config: StripeEnvironment,
  priceId: string,
  paymentMethodId: string,
  coupon?: string,
) => {
  const body = new URLSearchParams({
    customer: config.customerId,
    "items[0][price]": priceId,
    default_payment_method: paymentMethodId,
    payment_behavior: "default_incomplete",
  })

  if (coupon) {
    body.set("coupon", coupon)
  }

  body.append("expand[]", "latest_invoice.payment_intent")

  return stripeRequest<StripeSubscription>(config, `/subscriptions`, {
    method: "POST",
    body,
  })
}

export const detachStripePaymentMethod = (
  config: StripeEnvironment,
  paymentMethodId: string,
) => {
  return stripeRequest(config, `/payment_methods/${paymentMethodId}/detach`, {
    method: "POST",
  })
}

export const fetchStripeInvoice = (config: StripeEnvironment, invoiceId: string) => {
  return stripeRequest<StripeInvoice>(config, `/invoices/${invoiceId}`)
}

export const payStripeInvoice = (
  config: StripeEnvironment,
  invoiceId: string,
  paymentMethodId?: string,
) => {
  const body = new URLSearchParams()
  if (paymentMethodId) {
    body.append("payment_method", paymentMethodId)
  }

  return stripeRequest<StripeInvoice>(config, `/invoices/${invoiceId}/pay`, {
    method: "POST",
    body,
  })
}

export const fetchStripePaymentIntent = (
  config: StripeEnvironment,
  paymentIntentId: string,
) => {
  return stripeRequest<StripePaymentIntent>(config, `/payment_intents/${paymentIntentId}`)
}

export const confirmStripePaymentIntent = (
  config: StripeEnvironment,
  paymentIntentId: string,
  params?: Record<string, string>,
) => {
  const body = new URLSearchParams({
    ...(params ?? {}),
  })

  return stripeRequest<StripePaymentIntent>(config, `/payment_intents/${paymentIntentId}/confirm`, {
    method: "POST",
    body,
  })
}

export const updateStripePaymentMethodDetails = (
  config: StripeEnvironment,
  paymentMethodId: string,
  details: { billingName?: string },
): Promise<StripePaymentMethod | null> => {
  const body = new URLSearchParams()

  if (details.billingName) {
    body.append("billing_details[name]", details.billingName)
  }

  if ([...body.keys()].length === 0) {
    return Promise.resolve(null)
  }

  return stripeRequest<StripePaymentMethod>(config, `/payment_methods/${paymentMethodId}`, {
    method: "POST",
    body,
  })
}

export const fetchStripeSubscription = (
  config: StripeEnvironment,
  subscriptionId: string,
) => {
  const params = new URLSearchParams({
    "expand[]": "latest_invoice.payment_intent",
  })

  return stripeRequest<StripeSubscription>(config, `/subscriptions/${subscriptionId}?${params}`)
}

export const updateStripeSubscriptionCancellation = (
  config: StripeEnvironment,
  subscriptionId: string,
  cancelAtPeriodEnd: boolean,
) => {
  const body = new URLSearchParams({
    cancel_at_period_end: cancelAtPeriodEnd ? "true" : "false",
  })

  return stripeRequest<StripeSubscription>(config, `/subscriptions/${subscriptionId}`, {
    method: "POST",
    body,
  })
}
