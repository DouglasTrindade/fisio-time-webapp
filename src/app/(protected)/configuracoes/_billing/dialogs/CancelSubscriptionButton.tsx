"use client"

import { useState } from "react"
import { Ban, Loader2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"
import { useModalContext } from "@/contexts/modal-provider"

import { billingKeys } from "../hooks/queries"

interface Props {
  subscriptionId: string
}

export const CancelSubscriptionButton = ({ subscriptionId }: Props) => {
  const { openModal } = useModalContext()
  const [isPending, setPending] = useState(false)

  const handleOpen = () => {
    openModal(
      {
        component: CancelSubscriptionModal,
        onClose: () => setPending(false),
      },
      { subscriptionId, setPending },
    )
  }

  return (
    <Button
      variant="outline"
      className="gap-2 border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
      onClick={handleOpen}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
      {isPending ? "Processando" : "Cancelar renovação"}
    </Button>
  )
}

const CancelSubscriptionModal = ({
  subscriptionId,
  closeModal,
  setPending,
}: {
  subscriptionId: string
  closeModal: () => void
  setPending: (value: boolean) => void
}) => {
  const queryClient = useQueryClient()

  const handleConfirm = async () => {
    try {
      setPending(true)
      const response = await apiRequest<ApiResponse>("/billing/subscription/cancel", {
        method: "POST",
        data: { subscriptionId },
      })
      toast.success(response.message || "Cancelamento agendado")
      queryClient.invalidateQueries({ queryKey: billingKeys.summary() })
      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível cancelar a assinatura"
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Cancelar assinatura?</DialogTitle>
        <DialogDescription>
          A assinatura continuará ativa até o final do ciclo atual. Você pode reativá-la antes desse prazo.
        </DialogDescription>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">Confirme para agendar o cancelamento ao final do ciclo atual.</p>
      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={closeModal}>
          Voltar
        </Button>
        <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirm}>
          Confirmar
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
