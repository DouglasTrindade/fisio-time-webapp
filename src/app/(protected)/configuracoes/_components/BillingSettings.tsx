"use client"

import Link from "next/link"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, ShieldCheck } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getBillingStatusConfig } from "@/lib/billing/status"
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

export const BillingSettings = () => {
  const queryClient = useQueryClient()
  const [pendingMethod, setPendingMethod] = useState<string | null>(null)

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
                <div className="flex items-center gap-2">
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
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum cartão cadastrado. Utilize o fluxo de upgrade para adicionar um novo método.
            </p>
          )}
          <Button variant="outline" asChild className="w-full">
            <Link href="/upgrade">Adicionar novo cartão</Link>
          </Button>
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
                {invoices.map((invoice) => (
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
          ) : (
            <p className="text-sm text-muted-foreground">Ainda não há transações registradas.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const ErrorState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
    {message}
  </div>
)
