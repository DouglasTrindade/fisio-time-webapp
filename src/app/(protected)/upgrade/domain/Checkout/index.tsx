"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiResponse } from "@/types/api"
import type { BillingPaymentMethod, SubscriptionPlan } from "@/types/billing"
import { apiRequest } from "@/services/api"
import { getStripe } from "@/lib/stripe-client"

import { CheckoutForm } from "./components/CheckoutForm"

interface CheckoutDialogProps {
  plan: SubscriptionPlan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CheckoutDialog = ({ plan, open, onOpenChange }: CheckoutDialogProps) => {
  const router = useRouter()
  const stripePromise = useMemo(() => {
    try {
      return getStripe()
    } catch (error) {
      console.error(error)
      return undefined
    }
  }, [])

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingSecret, setLoadingSecret] = useState(false)
  const [secretError, setSecretError] = useState<string | null>(null)
  const [savedCards, setSavedCards] = useState<BillingPaymentMethod[] | null>(null)
  const [isLoadingCards, setLoadingCards] = useState(false)
  const [cardsError, setCardsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSecret = async () => {
      if (!open || !plan) {
        setClientSecret(null)
        setSavedCards(null)
        return
      }

      setLoadingSecret(true)
      setSecretError(null)
      try {
        const response = await apiRequest<ApiResponse<{ clientSecret: string }>>(
          "/billing/checkout/setup-intent",
          { method: "POST" },
        )
        if (!response.data?.clientSecret) {
          throw new Error("Stripe não retornou o client secret")
        }
        setClientSecret(response.data.clientSecret)
      } catch (error) {
        console.error(error)
        setSecretError("Não foi possível iniciar o checkout. Tente novamente.")
      } finally {
        setLoadingSecret(false)
      }
    }

    void fetchSecret()
  }, [open, plan])

  useEffect(() => {
    const fetchSavedCards = async () => {
      if (!open) {
        setSavedCards(null)
        return
      }
      setLoadingCards(true)
      setCardsError(null)
      try {
        const response = await apiRequest<ApiResponse<BillingPaymentMethod[]>>(
          "/billing/payment-methods",
        )
        setSavedCards(response.data ?? [])
      } catch (error) {
        console.error(error)
        setCardsError("Não foi possível carregar os cartões salvos.")
        setSavedCards([])
      } finally {
        setLoadingCards(false)
      }
    }

    void fetchSavedCards()
  }, [open])

  const handleSuccess = () => {
    onOpenChange(false)
    router.push("/configuracoes/cobranca")
  }

  const canRenderForm = plan && stripePromise && clientSecret && !isLoadingSecret && !secretError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>Preencha os dados para concluir a assinatura.</DialogDescription>
        </DialogHeader>

        {!plan ? null : !stripePromise ? (
          <p className="text-sm text-muted-foreground">
            Configure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY para iniciar o checkout.
          </p>
        ) : isLoadingSecret ? (
          <Skeleton className="h-32 w-full" />
        ) : secretError ? (
          <p className="text-sm text-destructive">{secretError}</p>
        ) : canRenderForm ? (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              plan={plan}
              clientSecret={clientSecret!}
              savedCards={savedCards ?? []}
              savedCardsLoading={isLoadingCards}
              cardsError={cardsError}
              onSuccess={handleSuccess}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
