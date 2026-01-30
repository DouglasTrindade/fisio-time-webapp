"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { BillingPaymentMethod } from "@/types/billing"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"
import { useModalContext } from "@/contexts/modal-provider"

import { billingKeys } from "../hooks/queries"

interface RemovePaymentMethodButtonProps {
  method: BillingPaymentMethod
  onSuccess: () => void
  disabled?: boolean
}

export const RemovePaymentMethodButton = ({ method, onSuccess, disabled }: RemovePaymentMethodButtonProps) => {
  const { openModal } = useModalContext()
  const [isPending, setPending] = useState(false)

  const handleOpen = () => {
    if (disabled) return
    openModal(
      {
        component: RemovePaymentModal,
        onClose: () => setPending(false),
      },
      { paymentMethodId: method.id, onSuccess, setPending, last4: method.last4 },
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled || isPending}
      className="text-destructive hover:text-destructive"
      onClick={handleOpen}
    >
      {isPending ? <Trash2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      <span className="sr-only">Remover cartão</span>
    </Button>
  )
}

const RemovePaymentModal = ({
  paymentMethodId,
  onSuccess,
  closeModal,
  setPending,
  last4,
}: {
  paymentMethodId: string
  onSuccess: () => void
  closeModal: () => void
  setPending: (value: boolean) => void
  last4: string
}) => {
  const queryClient = useQueryClient()

  const handleConfirm = async () => {
    try {
      setPending(true)
      const response = await apiRequest<ApiResponse>("/billing/payment-methods/detach", {
        method: "POST",
        data: { paymentMethodId },
      })
      toast.success(response.message || "Cartão removido")
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() })
      queryClient.invalidateQueries({ queryKey: billingKeys.summary() })
      onSuccess()
      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível remover o cartão"
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Remover cartão</DialogTitle>
        <DialogDescription>
          Deseja remover o cartão terminando em {last4}? Esta ação não pode ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={closeModal}>
          Cancelar
        </Button>
        <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirm}>
          Remover
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
