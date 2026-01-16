"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionsCard } from "./TransactionsCard"
import { AttendanceTypeChart } from "./AttendanceTypeChart"
import { MonthlyHistoryChart } from "./MonthlyHistoryChart"

export type FinanceTransaction = {
  id: string
  description: string
  amount: number
  account: string
  category: "Atendimento" | "Depósito"
  paymentMethod: string
  date: string
  paid: boolean
  additionalInfo?: string
}

type AttendanceChartEntry = {
  label: string
  total: number
}

type MonthlyHistoryEntry = {
  month: string
  income: number
  expense: number
}

interface FinanceResumePageProps {
  transactions: FinanceTransaction[]
  generalBalance: number
  attendanceChart: AttendanceChartEntry[]
  monthlyHistory: MonthlyHistoryEntry[]
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export const FinanceResumePage = ({
  transactions,
  generalBalance,
  attendanceChart,
  monthlyHistory,
}: FinanceResumePageProps) => {
  const { paidTotal, pendingTotal } = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.paid) {
          acc.paidTotal += transaction.amount
        } else {
          acc.pendingTotal += transaction.amount
        }

        return acc
      },
      { paidTotal: 0, pendingTotal: 0 },
    )
  }, [transactions])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/70 bg-card/85 shadow-lg">
          <CardHeader>
            <CardTitle>Saldo geral</CardTitle>
            <CardDescription>Total de receitas vinculadas aos atendimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{currency.format(generalBalance)}</div>
            <p className="text-sm text-muted-foreground">
              {transactions.length} transação{transactions.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/85 shadow-lg">
          <CardHeader>
            <CardTitle>Receitas pagas</CardTitle>
            <CardDescription>Valores confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{currency.format(paidTotal)}</div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/85 shadow-lg">
          <CardHeader>
            <CardTitle>Receitas pendentes</CardTitle>
            <CardDescription>Aguardando compensação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{currency.format(pendingTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <TransactionsCard
          className="lg:col-span-2"
          transactions={transactions}
          generalBalance={generalBalance}
        />
        <AttendanceTypeChart data={attendanceChart} />
      </div>

      <MonthlyHistoryChart data={monthlyHistory} />
    </div>
  )
}
