"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { FinanceTransaction } from "./FinanceResumePage"
import { NewRevenueDialog } from "./NewRevenueDialog"
import { NewExpenseDialog } from "./NewExpenseDialog"
import { Pagination } from "@/components/Pagination"

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

interface TransactionsCardProps {
  transactions: FinanceTransaction[]
  generalBalance: number
  className?: string
}

export const TransactionsCard = ({
  transactions,
  generalBalance,
  className,
}: TransactionsCardProps) => {
  const PAGE_SIZE = 8
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))

  useEffect(() => {
    setPage((prev) => {
      const next = Math.min(Math.max(1, prev), totalPages)
      return next
    })
  }, [totalPages])

  const visibleTransactions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return transactions.slice(start, start + PAGE_SIZE)
  }, [page, transactions])

  const paginationMeta = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      total: transactions.length,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }),
    [PAGE_SIZE, page, totalPages, transactions.length],
  )

  return (
    <Card className={cn("flex flex-col border-border/70 bg-card/85 shadow-lg", className)}>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle>Transações</CardTitle>
          <CardDescription>
            Saldo geral consolidado:{" "}
            <span className="font-semibold text-foreground">{currency.format(generalBalance)}</span>
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <NewExpenseDialog />
          <NewRevenueDialog />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto">
        {transactions.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{transaction.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "dd MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex h-6 items-center rounded-full px-2 text-xs font-medium",
                        transaction.kind === "expense"
                          ? "bg-rose-500/15 text-rose-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {transaction.kind === "expense"
                        ? transaction.expenseCategory ?? "Despesa"
                        : transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{transaction.account}</TableCell>
                  <TableCell className="text-xs uppercase text-muted-foreground">
                    {transaction.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex min-w-18 items-center justify-center rounded-full px-2 text-xs font-semibold uppercase tracking-wide",
                        transaction.paid
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400",
                      )}
                    >
                      {transaction.paid ? "Pago" : "Pendente"}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      transaction.kind === "expense" && "text-rose-400",
                    )}
                  >
                    {transaction.kind === "expense"
                      ? `- ${currency.format(transaction.amount)}`
                      : currency.format(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
            Nenhuma transação lançada até o momento.
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border/60">
        {transactions.length ? (
          <Pagination
            pagination={paginationMeta}
            onPageChange={setPage}
            resourceLabel="transações"
          />
        ) : (
          <span className="text-sm text-muted-foreground">Nenhuma transação para paginar.</span>
        )}
      </CardFooter>
    </Card>
  )
}
