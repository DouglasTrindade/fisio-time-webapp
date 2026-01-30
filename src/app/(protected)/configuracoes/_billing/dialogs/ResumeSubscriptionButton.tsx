"use client"

import { RefreshCw } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"

import { billingKeys } from "../hooks/queries"

interface Props {
  subscriptionId: string
}

export const ResumeSubscriptionButton = ({ subscriptionId }: Props) => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<ApiResponse>("/billing/subscription/resume", {
        method: "POST",
        data: { subscriptionId },
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Renovação automática reativada")
      queryClient.invalidateQueries({ queryKey: billingKeys.summary() })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível reativar a assinatura")
    },
  })

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Reativar renovação
    </Button>
  )
}
