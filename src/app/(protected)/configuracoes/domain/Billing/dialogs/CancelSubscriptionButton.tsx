"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"

import { billingKeys } from "../hooks/queries"

interface Props {
  subscriptionId: string
  onHide?: () => void
}

export const CancelSubscriptionButton = ({ subscriptionId, onHide }: Props) => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<ApiResponse>("/billing/subscription/cancel", {
        method: "POST",
        data: { subscriptionId },
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Cancelamento agendado")
      queryClient.invalidateQueries({ queryKey: billingKeys.summary() })
      onHide?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível cancelar a assinatura")
    },
  })

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cancelar assinatura?</DialogTitle>
        <DialogDescription>
          A assinatura continuará ativa até o final do ciclo atual. Você pode reativá-la antes desse prazo.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onHide?.()} disabled={mutation.isPending}>
          Voltar
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Cancelando..." : "Confirmar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
