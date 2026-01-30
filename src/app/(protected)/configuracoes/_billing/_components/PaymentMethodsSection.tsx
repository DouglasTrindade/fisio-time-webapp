"use client"

import { useState } from "react"
import { ShieldCheck, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { BillingPaymentMethod } from "@/types/billing"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"

import { billingKeys } from "../hooks/queries"
import { AddCardDialog } from "../dialogs/AddCardDialog"
import { EditPaymentMethodDialog } from "../dialogs/EditPaymentMethodDialog"
import { RemovePaymentMethodButton } from "../dialogs/RemovePaymentMethodButton"
import { ErrorState } from "./ErrorState"

interface PaymentMethodsSectionProps {
  methods?: BillingPaymentMethod[]
  isLoading: boolean
  isError: boolean
}

export const PaymentMethodsSection = ({
  methods,
  isLoading,
  isError,
}: PaymentMethodsSectionProps) => {
  const queryClient = useQueryClient()
  const [pendingMethod, setPendingMethod] = useState<string | null>(null)

  const invalidateBillingData = () => {
    queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() })
    queryClient.invalidateQueries({ queryKey: billingKeys.summary() })
  }

  const updateDefaultMethod = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      setPendingMethod(paymentMethodId)
      return apiRequest<ApiResponse>("/billing/payment-methods", {
        method: "PATCH",
        data: { paymentMethodId },
      })
    },
    onSuccess: (response) => {
      toast.success(response.message || "Cartão atualizado")
      invalidateBillingData()
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível atualizar o cartão")
    },
    onSettled: () => setPendingMethod(null),
  })

  const cards = methods ?? []

  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <CardTitle>Métodos de pagamento</CardTitle>
        <CardDescription>Escolha qual cartão será usado na cobrança recorrente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : isError ? (
          <ErrorState message="Não foi possível carregar os cartões cadastrados." />
        ) : cards.length > 0 ? (
          cards.map((method) => (
            <div
              key={method.id}
              className="flex flex-col gap-3 rounded-xl border border-border/80 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {method.brand.toUpperCase()} •••• {method.last4}
                </p>
                <p className="text-xs text-muted-foreground">
                  Expira {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                </p>
                {method.billingName ? (
                  <p className="text-xs text-muted-foreground">Titular: {method.billingName}</p>
                ) : null}
                {method.isDefault ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    Cartão padrão
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!method.isDefault ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateDefaultMethod.mutate(method.id)}
                    disabled={updateDefaultMethod.isPending && pendingMethod === method.id}
                  >
                    {updateDefaultMethod.isPending && pendingMethod === method.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Definir como padrão
                  </Button>
                ) : null}
                <EditPaymentMethodDialog method={method} onSuccess={invalidateBillingData} />
                <RemovePaymentMethodButton
                  method={method}
                  disabled={cards.length === 1}
                  onSuccess={invalidateBillingData}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum cartão cadastrado. Utilize o fluxo de upgrade para adicionar um novo método.
          </p>
        )}
        <AddCardDialog onSuccess={invalidateBillingData} />
      </CardContent>
    </Card>
  )
}
