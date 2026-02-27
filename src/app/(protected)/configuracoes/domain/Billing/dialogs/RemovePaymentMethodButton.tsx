"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { BillingPaymentMethod } from "@/types/billing"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"

interface RemovePaymentMethodButtonProps {
  method: BillingPaymentMethod
  onSuccess: () => void
  disabled?: boolean
  onHide?: () => void
}

export const RemovePaymentMethodButton = ({
  method,
  onSuccess,
  disabled,
  onHide,
}: RemovePaymentMethodButtonProps) => {
  const mutation = useMutation({
    mutationFn: async () =>
      apiRequest<ApiResponse>("/billing/payment-methods/detach", {
        method: "POST",
        data: { paymentMethodId: method.id },
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Cartão removido")
      onSuccess()
      onHide?.()
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível remover o cartão")
    },
  })

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Remover cartão</DialogTitle>
        <DialogDescription>
          Deseja remover o cartão terminando em {method.last4}? Esta ação não pode ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onHide?.()} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => mutation.mutate()}
          disabled={disabled || mutation.isPending}
        >
          {mutation.isPending ? "Removendo..." : "Remover"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
