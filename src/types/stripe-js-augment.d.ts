import "@stripe/stripe-js"

declare module "@stripe/stripe-js" {
  export type StripeEmbeddedCheckoutLineItemsChangeEvent = {
    checkoutSessionId: string
    lineItems: Array<{
      id?: string | null
      price?: string | null
      quantity: number
      description?: string | null
      amountSubtotal?: number | null
      amountTotal?: number | null
      currency?: string | null
    }>
  }
}
