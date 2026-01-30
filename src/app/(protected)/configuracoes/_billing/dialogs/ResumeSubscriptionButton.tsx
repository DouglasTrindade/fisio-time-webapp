"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
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

export const ResumeSubscriptionButton = ({ subscriptionId }: Props) => {
  const { openModal } = useModalContext()
  const [isPending, setPending] = useState(false)

  const handleOpen = () => {
    openModal(
      {
        component: ResumeSubscriptionModal,
        onClose: () => setPending(false),
      },
      { subscriptionId, setPending },
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpen}
      disabled={isPending}
      className="gap-2"
    >
      {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Reativar renovação
    </Button>
  )
}

const ResumeSubscriptionModal = ({
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
      const response = await apiRequest<ApiResponse>("/billing/subscription/resume", {
        method: "POST",
        data: { subscriptionId },
      })
      toast.success(response.message || "Renovação automática reativada")
      queryClient.invalidateQueries({ queryKey: billingKeys.summary() })
      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível reativar a assinatura"
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Reativar renovação</DialogTitle>
        <DialogDescription>
          Esta assinatura voltará a ser cobrada automaticamente ao final do período atual.
        </DialogDescription>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">Ao confirmar, a renovação automática será ativada novamente.</p>
      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={closeModal}>
          Cancelar
        </Button>
        <Button className="gap-2" onClick={handleConfirm}>
          Confirmar
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
