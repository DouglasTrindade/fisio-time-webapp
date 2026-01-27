"use client"

import { useEffect, useMemo, useState } from "react"
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { getStripe } from "@/lib/stripe-client"
import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"

import { addCardSchema, type AddCardFormValues } from "../schema"

interface AddCardDialogProps {
  onSuccess: () => void
}

export const AddCardDialog = ({ onSuccess }: AddCardDialogProps) => {
  const [open, setOpen] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingSecret, setLoadingSecret] = useState(false)
  const [secretError, setSecretError] = useState<string | null>(null)
  const [secretRefreshKey, setSecretRefreshKey] = useState(0)
  const stripePromise = useMemo(() => {
    try {
      return getStripe()
    } catch (error) {
      console.error(error)
      return undefined
    }
  }, [])

  useEffect(() => {
    const fetchSecret = async () => {
      if (!open || !stripePromise) {
        setClientSecret(null)
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
        setSecretError("Não foi possível iniciar o cadastro do cartão. Tente novamente.")
      } finally {
        setLoadingSecret(false)
      }
    }

    void fetchSecret()
  }, [open, stripePromise, secretRefreshKey])

  const handleCompleted = () => {
    onSuccess()
    setOpen(false)
    setClientSecret(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          + Adicionar novo cartão
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar novo cartão</DialogTitle>
          <DialogDescription>
            Cadastre um novo método de pagamento e escolha se ele deve ficar salvo e ser o padrão das cobranças.
          </DialogDescription>
        </DialogHeader>
        {!stripePromise ? (
          <p className="text-sm text-muted-foreground">
            Configure a variável NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY para habilitar o cadastro de cartões.
          </p>
        ) : isLoadingSecret ? (
          <Skeleton className="h-32 w-full" />
        ) : secretError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {secretError}
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setSecretRefreshKey((prev) => prev + 1)}
            >
              Tentar novamente
            </Button>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <AddCardForm clientSecret={clientSecret} onCompleted={handleCompleted} />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

const AddCardForm = ({
  clientSecret,
  onCompleted,
}: {
  clientSecret: string
  onCompleted: () => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setSubmitting] = useState(false)
  const form = useForm<AddCardFormValues>({
    resolver: zodResolver(addCardSchema),
    defaultValues: {
      cardHolder: "",
      saveCard: true,
      setAsDefault: true,
    },
  })

  const saveCard = form.watch("saveCard")

  useEffect(() => {
    if (!saveCard) {
      form.setValue("setAsDefault", false, { shouldDirty: true })
    }
  }, [saveCard, form])

  const handleSubmit = async (values: AddCardFormValues) => {
    if (!stripe || !elements) {
      toast.error("Stripe não inicializado.")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error("Não foi possível carregar o campo de cartão.")
      return
    }

    setSubmitting(true)
    try {
      const confirmation = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: values.cardHolder,
          },
        },
      })

      if (confirmation.error || confirmation.setupIntent?.status !== "succeeded") {
        throw new Error(confirmation.error?.message || "Falha ao confirmar o cartão")
      }

      const paymentMethodId = confirmation.setupIntent?.payment_method
      if (!paymentMethodId) {
        throw new Error("Stripe não retornou o método de pagamento")
      }

      if (!values.saveCard) {
        await apiRequest<ApiResponse>("/billing/payment-methods/detach", {
          method: "POST",
          data: { paymentMethodId },
        })
        toast.success("Cartão validado mas não salvo na conta.")
        onCompleted()
        return
      }

      if (values.setAsDefault) {
        await apiRequest<ApiResponse>("/billing/payment-methods", {
          method: "PATCH",
          data: { paymentMethodId },
        })
      }

      toast.success(
        values.setAsDefault ? "Cartão salvo e definido como padrão." : "Cartão salvo com sucesso.",
      )
      onCompleted()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar o cartão")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="cardHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titular do cartão</FormLabel>
              <FormControl>
                <Input placeholder="Nome como está no cartão" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    '::placeholder': { color: "#94a3b8" },
                  },
                },
              }}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="saveCard"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <div>
                <FormLabel>Salvar este cartão</FormLabel>
                <p className="text-xs text-muted-foreground">Mantém o cartão disponível para cobranças futuras.</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="setAsDefault"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <div>
                <FormLabel>Definir como padrão</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Usado automaticamente nas próximas cobranças.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!saveCard}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar cartão"}
        </Button>
      </form>
    </Form>
  )
}
