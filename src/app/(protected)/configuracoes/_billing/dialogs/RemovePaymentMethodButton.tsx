"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { BillingPaymentMethod } from "@/types/billing"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"

interface RemovePaymentMethodButtonProps {
  method: BillingPaymentMethod
  onSuccess: () => void
  disabled?: boolean
}

export const RemovePaymentMethodButton = ({
  method,
  onSuccess,
  disabled,
}: RemovePaymentMethodButtonProps) => {
  const [open, setOpen] = useState(false)
  const mutation = useMutation({
    mutationFn: async () =>
      apiRequest<ApiResponse>("/billing/payment-methods/detach", {
        method: "POST",
        data: { paymentMethodId: method.id },
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Cartão removido")
      setOpen(false)
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível remover o cartão")
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <span>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled || mutation.isPending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remover cartão</span>
          </Button>
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover cartão</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja remover o cartão terminando em {method.last4}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Removendo..." : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
