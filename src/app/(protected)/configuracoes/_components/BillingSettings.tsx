"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, PencilLine, ShieldCheck, Trash2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Pagination } from "@/components/Pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getBillingStatusConfig } from "@/lib/billing/status"
import { getStripe } from "@/lib/stripe-client"
import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { BillingInvoice, BillingPaymentMethod, BillingSummary } from "@/types/billing"

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const fetcher = async <T,>(endpoint: string) => {
  const response = await apiRequest<ApiResponse<T>>(endpoint)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Não foi possível carregar os dados")
  }
  return response.data
}

const formatDate = (value?: string) => {
  if (!value) return "—"
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR })
}

const addCardSchema = z.object({
  cardHolder: z.string().min(3, "Informe o nome completo"),
  saveCard: z.boolean().default(true),
  setAsDefault: z.boolean().default(true),
})

type AddCardFormValues = z.infer<typeof addCardSchema>

const editCardSchema = z.object({
  billingName: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length >= 3, {
      message: "Informe pelo menos 3 caracteres",
    }),
  setAsDefault: z.boolean().default(false),
})

type EditCardFormValues = z.infer<typeof editCardSchema>

export const BillingSettings = () => {
  const queryClient = useQueryClient()
  const [pendingMethod, setPendingMethod] = useState<string | null>(null)
  const [invoicePage, setInvoicePage] = useState(1)
  const invoicesPerPage = 6

  const summaryQuery = useQuery({
    queryKey: ["billing", "summary"],
    queryFn: () => fetcher<BillingSummary>("/billing/subscription"),
  })

  const paymentMethodsQuery = useQuery({
    queryKey: ["billing", "payment-methods"],
    queryFn: () => fetcher<BillingPaymentMethod[]>("/billing/payment-methods"),
  })

  const invoicesQuery = useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => fetcher<BillingInvoice[]>("/billing/invoices"),
  })

  const handleCardsUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["billing", "payment-methods"] })
    queryClient.invalidateQueries({ queryKey: ["billing", "summary"] })
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
      queryClient.invalidateQueries({ queryKey: ["billing", "payment-methods"] })
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível atualizar o cartão")
    },
    onSettled: () => setPendingMethod(null),
  })

  const summary = summaryQuery.data
  const paymentMethods = paymentMethodsQuery.data
  const invoices = invoicesQuery.data
  const paginatedInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) return []
    const start = (invoicePage - 1) * invoicesPerPage
    return invoices.slice(start, start + invoicesPerPage)
  }, [invoices, invoicePage, invoicesPerPage])

  const invoicesPagination = useMemo(() => {
    if (!invoices || invoices.length <= invoicesPerPage) return null
    const total = invoices.length
    const totalPages = Math.max(1, Math.ceil(total / invoicesPerPage))
    return {
      page: invoicePage,
      limit: invoicesPerPage,
      total,
      totalPages,
      hasPrev: invoicePage > 1,
      hasNext: invoicePage < totalPages,
    }
  }, [invoices, invoicePage, invoicesPerPage])
  const visibleInvoices = (invoicesPagination ? paginatedInvoices : invoices) ?? []

  useEffect(() => {
    if (!invoices || invoices.length === 0) {
      setInvoicePage(1)
      return
    }
    const totalPages = Math.max(1, Math.ceil(invoices.length / invoicesPerPage))
    if (invoicePage > totalPages) {
      setInvoicePage(totalPages)
    }
  }, [invoices, invoicePage, invoicesPerPage])

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/85 shadow-lg">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{summary?.planName ?? "Plano não encontrado"}</CardTitle>
            <CardDescription>
              {summary ? (
                summary.status === "inactive" ? (
                  "Nenhuma assinatura ativa"
                ) : (
                  <span>
                    {(() => {
                      const config = getBillingStatusConfig(summary.status)
                      return (
                        <>
                          Status:
                          <span
                            className={cn(
                              "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                              config.badgeClass,
                            )}
                          >
                            {config.label}
                          </span>
                        </>
                      )
                    })()}
                    <span className="ml-2">
                      Próxima cobrança em {formatDate(summary.periodEndsAt)} • {currency.format(summary.amount)} / mês
                    </span>
                  </span>
                )
              ) : summaryQuery.isLoading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                "Não foi possível carregar sua assinatura."
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/upgrade">Alterar plano</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/70 bg-card/85 shadow-lg">
        <CardHeader>
          <CardTitle>Métodos de pagamento</CardTitle>
          <CardDescription>Escolha qual cartão será usado na cobrança recorrente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentMethodsQuery.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : paymentMethodsQuery.isError ? (
            <ErrorState message="Não foi possível carregar os cartões cadastrados." />
          ) : paymentMethods && paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
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
                  <EditCardDialog method={method} onSuccess={handleCardsUpdated} />
                  <DeleteCardButton
                    method={method}
                    disabled={paymentMethods?.length === 1}
                    onSuccess={handleCardsUpdated}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum cartão cadastrado. Utilize o fluxo de upgrade para adicionar um novo método.
            </p>
          )}
          <AddCardDialog onSuccess={handleCardsUpdated} />
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/85 shadow-lg">
        <CardHeader>
          <CardTitle>Histórico de transações</CardTitle>
          <CardDescription>Detalhes das últimas cobranças.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {invoicesQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : invoicesQuery.isError ? (
            <ErrorState message="Não foi possível carregar o histórico de cobranças." />
          ) : invoices && invoices.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.hostedInvoiceUrl ? (
                          <Link
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {invoice.reference}
                          </Link>
                        ) : (
                          invoice.reference
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const config = getBillingStatusConfig(invoice.status)
                          return (
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs",
                                config.badgeClass,
                              )}
                            >
                              {config.label}
                            </span>
                          )
                        })()}
                      </TableCell>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {currency.format(invoice.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {invoicesPagination ? (
                <Pagination
                  pagination={invoicesPagination}
                  onPageChange={setInvoicePage}
                  className="mt-4"
                  resourceLabel="transações"
                />
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Ainda não há transações registradas.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const AddCardDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingSecret, setLoadingSecret] = useState(false)
  const [secretError, setSecretError] = useState<string | null>(null)
  const [secretRefreshKey, setSecretRefreshKey] = useState(0)
  const stripePromise = useMemo(() => {
    try {
      return getStripe()
    } catch (error) {
      console.error(error)
      return undefined
    }
  }, [])

  useEffect(() => {
    const fetchSecret = async () => {
      if (!open) {
        setClientSecret(null)
        return
      }

      if (!stripePromise) return

      setLoadingSecret(true)
      setSecretError(null)
      try {
        const response = await apiRequest<ApiResponse<{ clientSecret: string }>>(
          "/billing/checkout/setup-intent",
          { method: "POST" },
        )
        if (!response.data?.clientSecret) {
          throw new Error("Stripe não retornou o client secret")
        }
        setClientSecret(response.data.clientSecret)
      } catch (error) {
        console.error(error)
        setSecretError("Não foi possível iniciar o cadastro do cartão. Tente novamente.")
      } finally {
        setLoadingSecret(false)
      }
    }

    void fetchSecret()
  }, [open, stripePromise, secretRefreshKey])

  const handleSuccess = () => {
    onSuccess()
    setOpen(false)
    setClientSecret(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          + Adicionar novo cartão
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar novo cartão</DialogTitle>
          <DialogDescription>
            Cadastre um novo método de pagamento e escolha se ele deve ficar salvo e ser o padrão das cobranças.
          </DialogDescription>
        </DialogHeader>
        {!stripePromise ? (
          <p className="text-sm text-muted-foreground">
            Configure a variável NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY para habilitar o cadastro de cartões.
          </p>
        ) : isLoadingSecret ? (
          <Skeleton className="h-32 w-full" />
        ) : secretError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {secretError}
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSecretRefreshKey((prev) => prev + 1)
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <AddCardForm clientSecret={clientSecret} onCompleted={handleSuccess} />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

const AddCardForm = ({
  clientSecret,
  onCompleted,
}: {
  clientSecret: string
  onCompleted: () => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setSubmitting] = useState(false)
  const form = useForm<AddCardFormValues>({
    resolver: zodResolver(addCardSchema),
    defaultValues: {
      cardHolder: "",
      saveCard: true,
      setAsDefault: true,
    },
  })

  const saveCard = form.watch("saveCard")

  useEffect(() => {
    if (!saveCard) {
      form.setValue("setAsDefault", false, { shouldDirty: true })
    }
  }, [saveCard, form])

  const handleSubmit = async (values: AddCardFormValues) => {
    if (!stripe || !elements) {
      toast.error("Stripe não inicializado.")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error("Não foi possível carregar o campo de cartão.")
      return
    }

    setSubmitting(true)
    try {
      const confirmation = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: values.cardHolder,
          },
        },
      })

      if (confirmation.error || confirmation.setupIntent?.status !== "succeeded") {
        throw new Error(confirmation.error?.message || "Falha ao confirmar o cartão")
      }

      const paymentMethodId = confirmation.setupIntent?.payment_method
      if (!paymentMethodId) {
        throw new Error("Stripe não retornou o método de pagamento")
      }

      if (!values.saveCard) {
        await apiRequest<ApiResponse>("/billing/payment-methods/detach", {
          method: "POST",
          data: { paymentMethodId },
        })
        toast.success("Cartão validado mas não salvo na conta.")
        onCompleted()
        return
      }

      if (values.setAsDefault) {
        await apiRequest<ApiResponse>("/billing/payment-methods", {
          method: "PATCH",
          data: { paymentMethodId },
        })
      }

      toast.success(
        values.setAsDefault ? "Cartão salvo e definido como padrão." : "Cartão salvo com sucesso.",
      )
      onCompleted()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar o cartão")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="cardHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titular do cartão</FormLabel>
              <FormControl>
                <Input placeholder="Nome como está no cartão" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Dados do cartão</FormLabel>
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#ffffff",
                    '::placeholder': { color: "#94a3b8" },
                  },
                },
              }}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="saveCard"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <div>
                <FormLabel>Salvar este cartão</FormLabel>
                <p className="text-xs text-muted-foreground">Mantém o cartão disponível para cobranças futuras.</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="setAsDefault"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <div>
                <FormLabel>Definir como padrão</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Usado automaticamente nas próximas cobranças.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!saveCard}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar cartão"}
        </Button>
      </form>
    </Form>
  )
}

const EditCardDialog = ({
  method,
  onSuccess,
}: {
  method: BillingPaymentMethod
  onSuccess: () => void
}) => {
  const [open, setOpen] = useState(false)
  const mutation = useMutation({
    mutationFn: async (payload: { paymentMethodId: string; billingName?: string; setAsDefault?: boolean }) =>
      apiRequest<ApiResponse>("/billing/payment-methods/update", {
        method: "PATCH",
        data: payload,
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Cartão atualizado")
      onSuccess()
      setOpen(false)
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
    if (open) {
      form.reset({
        billingName: method.billingName ?? "",
        setAsDefault: method.isDefault,
      })
    }
  }, [form, method.billingName, method.isDefault, open])

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
          <span className="sr-only">Editar cartão</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

const DeleteCardButton = ({
  method,
  onSuccess,
  disabled,
}: {
  method: BillingPaymentMethod
  onSuccess: () => void
  disabled?: boolean
}) => {
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

const ErrorState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
    {message}
  </div>
)
