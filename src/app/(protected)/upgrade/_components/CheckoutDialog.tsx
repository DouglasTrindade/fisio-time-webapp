"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getStripe } from "@/lib/stripe-client"
import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { BillingPaymentMethod, SubscriptionPlan } from "@/types/billing"

type SubscribeResponse = {
  subscriptionId: string
  status: string
  paymentIntentClientSecret?: string | null
  paymentIntentStatus?: string | null
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const checkoutSchema = z.object({
  cardHolder: z.string().min(3, "Informe o nome completo").optional(),
  coupon: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Você precisa aceitar os termos de uso" }),
  }),
  useSavedCard: z.boolean().default(false),
  savedPaymentMethodId: z.string().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

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

const CheckoutForm = ({
  plan,
  clientSecret,
  savedCards,
  savedCardsLoading,
  cardsError,
  onSuccess,
}: {
  plan: SubscriptionPlan
  clientSecret: string
  savedCards: BillingPaymentMethod[]
  savedCardsLoading: boolean
  cardsError: string | null
  onSuccess: () => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setSubmitting] = useState(false)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardHolder: "",
      coupon: "",
      acceptTerms: false,
      useSavedCard: savedCards.length > 0,
      savedPaymentMethodId: savedCards[0]?.id,
    },
  })
  const useSavedCard = form.watch("useSavedCard")
  const selectedSavedCardId = form.watch("savedPaymentMethodId")
  const selectedSavedCard = savedCards.find((card) => card.id === selectedSavedCardId)

  useEffect(() => {
    form.reset({
      cardHolder: "",
      coupon: "",
      acceptTerms: false,
      useSavedCard: savedCards.length > 0,
      savedPaymentMethodId: savedCards[0]?.id,
    })
  }, [savedCards, form])

  useEffect(() => {
    if (useSavedCard) {
      form.setValue("cardHolder", selectedSavedCard?.billingName ?? "")
    } else if (!form.getValues("cardHolder")) {
      form.setValue("cardHolder", "")
    }
  }, [useSavedCard, selectedSavedCard, form])

  const handleSubmit = async (values: CheckoutFormValues) => {
    setSubmitting(true)

    try {
      let paymentMethodId: string | null = null

      if (values.useSavedCard) {
        if (!values.savedPaymentMethodId) {
          throw new Error("Selecione um cartão salvo")
        }
        paymentMethodId = values.savedPaymentMethodId
      } else {
        if (!values.cardHolder?.trim()) {
          throw new Error("Informe o titular do cartão")
        }
        if (!stripe || !elements) {
          throw new Error("Stripe não inicializado.")
        }
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) {
          throw new Error("Não foi possível carregar o campo de cartão.")
        }
        const confirmation = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: values.cardHolder || undefined,
            },
          },
        })

        if (confirmation.error || confirmation.setupIntent?.status !== "succeeded") {
          throw new Error(confirmation.error?.message || "Falha ao confirmar o cartão")
        }

        paymentMethodId = confirmation.setupIntent?.payment_method ?? null
        if (!paymentMethodId) {
          throw new Error("Stripe não retornou o método de pagamento")
        }
      }

      const response = await apiRequest<ApiResponse<SubscribeResponse>>("/billing/checkout/subscribe", {
        method: "POST",
        data: {
          planId: plan.id,
          paymentMethodId,
          coupon: values.coupon?.trim() || undefined,
        },
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || "Falha ao criar assinatura")
      }

      if (response.data.paymentIntentClientSecret) {
        const paymentConfirmation = await stripe.confirmCardPayment(
          response.data.paymentIntentClientSecret,
          {
            payment_method: paymentMethodId,
          },
        )

        if (
          paymentConfirmation.error ||
          paymentConfirmation.paymentIntent?.status !== "succeeded"
        ) {
          throw new Error(
            paymentConfirmation.error?.message ||
              "Não foi possível confirmar o pagamento",
          )
        }
      } else if (response.data.paymentIntentStatus && response.data.paymentIntentStatus !== "succeeded") {
        throw new Error("Pagamento pendente. Tente novamente ou use outro cartão")
      }

      toast.success(response.message || `Assinatura do ${plan.name} confirmada!`)
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Erro ao processar o checkout")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!clientSecret) {
      form.reset()
    }
  }, [clientSecret, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {savedCardsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : savedCards.length > 0 ? (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Usar cartão salvo</p>
                  <p className="text-xs text-muted-foreground">
                    {cardsError ?? "Selecione um cartão cadastrado ou adicione um novo abaixo."}
                  </p>
                </div>
                <Switch
                  checked={useSavedCard}
                  onCheckedChange={(checked) => form.setValue("useSavedCard", checked)}
                />
              </div>
              {useSavedCard ? (
                cardsError ? (
                  <p className="text-xs text-destructive">{cardsError}</p>
                ) : (
                  <RadioGroup
                    value={selectedSavedCardId ?? ""}
                    onValueChange={(value) => form.setValue("savedPaymentMethodId", value)}
                    className="space-y-2"
                  >
                    {savedCards.map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-3"
                      >
                        <RadioGroupItem value={method.id} />
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            {method.brand.toUpperCase()} •••• {method.last4}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expira {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                          </p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                )
              ) : null}
            </div>
          ) : null}

          <FormField
            control={form.control}
            name="cardHolder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titular do cartão</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome como está no cartão"
                    {...field}
                    disabled={useSavedCard}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!useSavedCard ? (
            <div className="space-y-2">
              <FormLabel>Dados do cartão</FormLabel>
              <div className="rounded-lg border border-border/60 bg-background/70 p-3">
                <CardElement
                  options={{
                    hidePostalCode: true,
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#ffffff",
                        '::placeholder': {
                          color: "#94a3b8",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          ) : null}

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-lg border border-border/60 p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    onChange={(event) => field.onChange(event.target.checked)}
                    checked={field.value}
                    className="mt-1 h-4 w-4 rounded border-border"
                  />
                </FormControl>
                <div>
                  <FormLabel className="font-medium">Concordo com os termos de uso</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    A assinatura será renovada automaticamente até que seja cancelada.
                  </p>
                </div>
                <FormMessage className="col-span-2" />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Resumo</p>
            <p className="text-lg font-semibold">{plan.name}</p>
            <p className="text-2xl font-bold">
              {currency.format(plan.price)}
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </p>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <FormField
            control={form.control}
            name="coupon"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Cupom</FormLabel>
                <FormControl>
                  <Input placeholder="PROMO2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="mt-6">
            <Button type="submit" className="w-full" disabled={isSubmitting || !stripe || !elements}>
              {isSubmitting ? "Processando..." : "Confirmar e assinar"}
            </Button>
          </DialogFooter>
        </div>
      </form>
    </Form>
  )
}
