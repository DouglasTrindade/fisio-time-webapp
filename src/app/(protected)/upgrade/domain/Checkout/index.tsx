"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { Skeleton } from "@/components/ui/skeleton"
import { StripeElementsProvider } from "@/components/stripe/elements"
import { useModalContext } from "@/contexts/modal-provider"
import type { ApiResponse } from "@/types/api"
import type { BillingPaymentMethod, SubscriptionPlan } from "@/types/billing"
import { apiRequest } from "@/services/api"

import { CheckoutForm } from "./components/CheckoutForm"

interface CheckoutDialogProps {
  plan: SubscriptionPlan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const fetchSetupIntent = async () => {
  const response = await apiRequest<ApiResponse<{ clientSecret: string }>>(
    "/billing/checkout/setup-intent",
    { method: "POST" },
  )
  if (!response.data?.clientSecret) {
    throw new Error("Stripe não retornou o client secret")
  }
  return response.data.clientSecret
}

const fetchPaymentMethods = async () => {
  const response = await apiRequest<ApiResponse<BillingPaymentMethod[]>>(
    "/billing/payment-methods",
  )
  return response.data ?? []
}

export const CheckoutDialog = ({ plan, open, onOpenChange }: CheckoutDialogProps) => {
  const router = useRouter()
  const { openModal } = useModalContext()

  const shouldFetch = Boolean(open && plan)

  const {
    data: clientSecret,
    isLoading: isLoadingSecret,
    error: secretError,
    refetch: refetchSecret,
  } = useQuery({
    queryKey: ["checkout", "setupIntent", plan?.id],
    queryFn: fetchSetupIntent,
    enabled: shouldFetch,
    retry: 1,
  })

  const {
    data: savedCards = [],
    isLoading: isLoadingCards,
    error: cardsError,
    refetch: refetchCards,
  } = useQuery({
    queryKey: ["checkout", "paymentMethods"],
    queryFn: fetchPaymentMethods,
    enabled: shouldFetch,
    retry: 1,
  })

  const payloadRef = useRef<string>("")

  const modalPayload = useMemo(() => {
    if (!shouldFetch) return ""
    return JSON.stringify({
      planId: plan?.id,
      clientSecret,
      isLoadingSecret,
      secretError: secretError instanceof Error ? secretError.message : null,
      savedCards: savedCards.map((card) => card.id).join("|"),
      isLoadingCards,
      cardsError: cardsError instanceof Error ? cardsError.message : null,
    })
  }, [
    shouldFetch,
    plan?.id,
    clientSecret,
    isLoadingSecret,
    secretError,
    savedCards,
    isLoadingCards,
    cardsError,
  ])

  useEffect(() => {
    if (!shouldFetch) {
      payloadRef.current = ""
      return
    }

    if (payloadRef.current === modalPayload) {
      return
    }

    payloadRef.current = modalPayload

    openModal({
      component: CheckoutModal,
      props: {
        plan,
        clientSecret: clientSecret ?? null,
        isLoadingSecret,
        secretError: secretError instanceof Error ? secretError.message : null,
        savedCards,
        isLoadingCards,
        cardsError: cardsError instanceof Error ? cardsError.message : null,
        onRetrySecret: () => refetchSecret(),
        onRetryCards: () => refetchCards(),
        onSuccess: () => {
          onOpenChange(false)
          router.push("/configuracoes/cobranca")
        },
      },
      onClose: () => onOpenChange(false),
    })
  }, [
    shouldFetch,
    modalPayload,
    openModal,
    plan,
    clientSecret,
    isLoadingSecret,
    secretError,
    savedCards,
    isLoadingCards,
    cardsError,
    refetchSecret,
    refetchCards,
    onOpenChange,
    router,
  ])

  return null
}

const CheckoutModal = ({
  plan,
  clientSecret,
  isLoadingSecret,
  secretError,
  savedCards,
  isLoadingCards,
  cardsError,
  onRetrySecret,
  onRetryCards,
  onSuccess,
}: {
  plan: SubscriptionPlan | null
  clientSecret: string | null
  isLoadingSecret: boolean
  secretError: string | null
  savedCards: BillingPaymentMethod[]
  isLoadingCards: boolean
  cardsError: string | null
  onRetrySecret: () => void
  onRetryCards: () => void
  onSuccess: () => void
}) => {
  const hasStripeKey = useMemo(() => Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY), [])

  if (!plan) {
    return null
  }

  if (!hasStripeKey) {
    return (
      <p className="text-sm text-muted-foreground">
        Configure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY para iniciar o checkout.
      </p>
    )
  }

  if (isLoadingSecret) {
    return <Skeleton className="h-36 w-full" />
  }

  if (secretError) {
    return (
      <div className="space-y-3 text-sm text-destructive">
        <p>{secretError}</p>
        <button type="button" onClick={onRetrySecret} className="text-primary">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!clientSecret) {
    return null
  }

  return (
    <StripeElementsProvider options={{ clientSecret }}>
      <CheckoutForm
        plan={plan}
        clientSecret={clientSecret}
        savedCards={savedCards}
        savedCardsLoading={isLoadingCards}
        cardsError={cardsError}
        onRetryCards={onRetryCards}
        onSuccess={onSuccess}
      />
    </StripeElementsProvider>
  )
}
