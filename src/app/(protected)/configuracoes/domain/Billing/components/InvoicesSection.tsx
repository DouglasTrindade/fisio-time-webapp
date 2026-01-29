"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { Pagination } from "@/components/Pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { BillingInvoice } from "@/types/billing"
import { getBillingStatusConfig } from "@/lib/billing/status"
import { cn } from "@/lib/utils"

import { currencyFormatter, formatBillingDate } from "../utils"
import { ErrorState } from "./ErrorState"

interface InvoicesSectionProps {
  invoices?: BillingInvoice[]
  isLoading: boolean
  isError: boolean
}

export const InvoicesSection = ({ invoices, isLoading, isError }: InvoicesSectionProps) => {
  const [page, setPage] = useState(1)
  const pageSize = 6

  const total = invoices?.length ?? 0
  const paginated = useMemo(() => {
    if (!invoices || invoices.length === 0) return []
    const start = (page - 1) * pageSize
    return invoices.slice(start, start + pageSize)
  }, [invoices, page])

  const pagination =
    total > pageSize
      ? {
          page,
          limit: pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
          hasPrev: page > 1,
          hasNext: page * pageSize < total,
        }
      : null

  useEffect(() => {
    if (!pagination) {
      setPage(1)
      return
    }
    if (page > pagination.totalPages) {
      setPage(pagination.totalPages)
    }
  }, [pagination, page])

  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <CardTitle>Histórico de transações</CardTitle>
        <CardDescription>Detalhes das últimas cobranças.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <ErrorState message="Não foi possível carregar o histórico de cobranças." />
        ) : (invoices?.length ?? 0) > 0 ? (
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
                {(pagination ? paginated : invoices)!.map((invoice) => (
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
                            className={cn("inline-flex rounded-full px-2 py-0.5 text-xs", config.badgeClass)}
                          >
                            {config.label}
                          </span>
                        )
                      })()}
                    </TableCell>
                    <TableCell>{formatBillingDate(invoice.createdAt)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {currencyFormatter.format(invoice.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pagination ? (
              <Pagination
                pagination={pagination}
                onPageChange={setPage}
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
  )
}
