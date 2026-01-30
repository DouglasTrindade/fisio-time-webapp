"use client"

import { useEffect } from "react"
import { PencilLine } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { BillingPaymentMethod } from "@/types/billing"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"
import { useModalContext } from "@/contexts/modal-provider"

import { editCardSchema, type EditCardFormValues } from "../schema"

interface EditPaymentMethodDialogProps {
  method: BillingPaymentMethod
  onSuccess: () => void
}

export const EditPaymentMethodDialog = ({ method, onSuccess }: EditPaymentMethodDialogProps) => {
  const { openModal } = useModalContext()

  const handleOpen = () => {
    openModal(
      {
        component: EditPaymentMethodModal,
      },
      { method, onSuccess },
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleOpen}>
      <PencilLine className="h-4 w-4" />
      <span className="sr-only">Editar cartão</span>
    </Button>
  )
}

const EditPaymentMethodModal = ({
  method,
  onSuccess,
  closeModal,
}: {
  method: BillingPaymentMethod
  onSuccess: () => void
  closeModal: () => void
}) => {
  const mutation = useMutation({
    mutationFn: async (payload: { paymentMethodId: string; billingName?: string; setAsDefault?: boolean }) =>
      apiRequest<ApiResponse>("/billing/payment-methods/update", {
        method: "PATCH",
        data: payload,
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Cartão atualizado")
      onSuccess()
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível atualizar o cartão")
    },
  })

  const form = useForm<EditCardFormValues>({
    resolver: zodResolver(editCardSchema),
    defaultValues: {
      billingName: method.billingName ?? "",
      setAsDefault: method.isDefault,
    },
  })

  useEffect(() => {
    form.reset({
      billingName: method.billingName ?? "",
      setAsDefault: method.isDefault,
    })
  }, [form, method.billingName, method.isDefault])

  const handleSubmit = (values: EditCardFormValues) => {
    const trimmedName = values.billingName?.trim() || ""
    const shouldUpdateName =
      !!trimmedName && trimmedName !== (method.billingName ?? "").trim()
    const shouldSetDefault = values.setAsDefault && !method.isDefault

    if (!shouldUpdateName && !shouldSetDefault) {
      toast.info("Nenhuma alteração para aplicar.")
      return
    }

    const payload: { paymentMethodId: string; billingName?: string; setAsDefault?: boolean } = {
      paymentMethodId: method.id,
    }

    if (shouldUpdateName) {
      payload.billingName = trimmedName
    }
    if (shouldSetDefault) {
      payload.setAsDefault = true
    }

    mutation.mutate(payload)
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Editar cartão</DialogTitle>
        <DialogDescription>Atualize o titular ou defina este cartão como padrão.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="billingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titular</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do titular" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!method.isDefault ? (
            <FormField
              control={form.control}
              name="setAsDefault"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                  <div>
                    <FormLabel>Definir como padrão</FormLabel>
                    <p className="text-xs text-muted-foreground">Passa a ser utilizado nas próximas cobranças.</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          ) : (
            <div className="rounded-lg border border-border/60 px-4 py-3 text-sm text-muted-foreground">
              Este cartão já é o padrão da conta.
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
