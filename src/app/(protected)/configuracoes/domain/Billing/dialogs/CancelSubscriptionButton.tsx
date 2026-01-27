"use client"

import { useState } from "react"
import { Ban } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"

import { billingKeys } from "../hooks/queries"

interface Props {
  subscriptionId: string
}

export const CancelSubscriptionButton = ({ subscriptionId }: Props) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<ApiResponse>("/billing/subscription/cancel", {
        method: "POST",
        data: { subscriptionId },
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Cancelamento agendado")
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: billingKeys.summary() })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível cancelar a assinatura")
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Ban className="h-4 w-4" />
          Cancelar renovação
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
          <AlertDialogDescription>
            A assinatura continuará ativa até o final do ciclo atual. Você pode reativá-la antes desse prazo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Cancelando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
