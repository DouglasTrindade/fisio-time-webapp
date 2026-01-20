import { type NextRequest, NextResponse } from "next/server"
import {
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  TransactionCategory,
  TransactionKind,
  TransactionStatus,
} from "@prisma/client"

import { prisma } from "@/lib/prisma"
import {
  createApiError,
  createApiResponse,
  handleApiError,
} from "@/lib/api/utils"
import type { ApiResponse } from "@/types/api"
import type { FinanceOverviewReport } from "@/types/reports"

const DEFAULT_RANGE_DAYS = 90

const incomeCategoryLabels: Record<Lowercase<TransactionCategory>, string> = {
  attendance: "Atendimentos",
  deposit: "Depósitos",
}

const normalizeEnumValue = (value?: string | null) =>
  value ? value.toString().toLowerCase() : null

const roundCurrency = (value: number) =>
  Math.round((Number.isFinite(value) ? value : 0) * 100) / 100

const getReferenceDate = (transaction: {
  paidAt: Date | null
  dueDate: Date | null
  competenceDate: Date | null
  createdAt: Date
}) => {
  return (
    transaction.paidAt ??
    transaction.dueDate ??
    transaction.competenceDate ??
    transaction.createdAt
  )
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<FinanceOverviewReport>>> {
  try {
    const { searchParams } = new URL(request.url)
    const endParam = searchParams.get("end")
    const startParam = searchParams.get("start")

    const today = new Date()
    const rangeEnd = endOfDay(endParam ? new Date(endParam) : today)
    const rangeStart = startOfDay(
      startParam
        ? new Date(startParam)
        : subDays(rangeEnd, DEFAULT_RANGE_DAYS - 1),
    )

    if (
      Number.isNaN(rangeStart.getTime()) ||
      Number.isNaN(rangeEnd.getTime())
    ) {
      return NextResponse.json(
        createApiError("Período inválido informado."),
        { status: 400 },
      )
    }

    if (rangeStart > rangeEnd) {
      return NextResponse.json(
        createApiError("A data inicial deve ser menor que a final."),
        { status: 400 },
      )
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          {
            paidAt: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
          {
            dueDate: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
          {
            competenceDate: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
          {
            createdAt: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    })

    let totalIncome = 0
    let totalExpenses = 0
    let paidIncome = 0
    let pendingIncome = 0
    let paidExpenses = 0
    let pendingExpenses = 0

    const incomeCategories = new Map<string, number>()
    const expenseCategories = new Map<string, number>()
    const historyBuckets = new Map<string, { income: number; expense: number }>()

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount ?? 0)
      if (!Number.isFinite(amount) || amount <= 0) {
        return
      }

      const normalizedKind = normalizeEnumValue(transaction.kind)
      const normalizedStatus = normalizeEnumValue(transaction.status)
      const normalizedCategory = normalizeEnumValue(transaction.category) as
        | keyof typeof incomeCategoryLabels
        | null
      const isExpense = normalizedKind === "expense"
      const isPaid =
        normalizedStatus === normalizeEnumValue(TransactionStatus.PAID)
      const referenceDate = getReferenceDate(transaction)
      const monthKey = `${referenceDate.getFullYear()}-${String(
        referenceDate.getMonth() + 1,
      ).padStart(2, "0")}`
      const historyEntry =
        historyBuckets.get(monthKey) ?? { income: 0, expense: 0 }

      if (isExpense) {
        totalExpenses += amount
        if (isPaid) {
          paidExpenses += amount
        } else {
          pendingExpenses += amount
        }

        const label = transaction.expenseCategory?.trim() || "Outras despesas"
        expenseCategories.set(
          label,
          (expenseCategories.get(label) ?? 0) + amount,
        )
        historyEntry.expense += amount
      } else {
        totalIncome += amount
        if (isPaid) {
          paidIncome += amount
        } else {
          pendingIncome += amount
        }

        const categoryLabel = normalizedCategory
          ? incomeCategoryLabels[normalizedCategory] ?? "Outras receitas"
          : "Outras receitas"
        incomeCategories.set(
          categoryLabel,
          (incomeCategories.get(categoryLabel) ?? 0) + amount,
        )
        historyEntry.income += amount
      }

      historyBuckets.set(monthKey, historyEntry)
    })

    const balance = totalIncome - totalExpenses

    const historyRange = eachMonthOfInterval({
      start: startOfMonth(rangeStart),
      end: endOfMonth(rangeEnd),
    })

    const history = historyRange.map((date) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`
      const entry = historyBuckets.get(key) ?? { income: 0, expense: 0 }

      return {
        month: key,
        label: format(date, "MMM yyyy", { locale: ptBR }).replace(".", ""),
        income: roundCurrency(entry.income),
        expense: roundCurrency(entry.expense),
      }
    })

    const mapToEntries = (bucket: Map<string, number>) =>
      Array.from(bucket.entries())
        .map(([label, value]) => ({
          label,
          value: roundCurrency(value),
        }))
        .sort((a, b) => b.value - a.value)

    const summary = {
      totalIncome: roundCurrency(totalIncome),
      totalExpenses: roundCurrency(totalExpenses),
      balance: roundCurrency(balance),
      paidIncome: roundCurrency(paidIncome),
      pendingIncome: roundCurrency(pendingIncome),
      paidExpenses: roundCurrency(paidExpenses),
      pendingExpenses: roundCurrency(pendingExpenses),
    }

    const dre = {
      grossRevenue: summary.totalIncome,
      deductions: summary.pendingIncome,
      netRevenue: roundCurrency(summary.totalIncome - summary.pendingIncome),
      operationalExpenses: summary.totalExpenses,
      operationalResult: roundCurrency(
        summary.totalIncome - summary.pendingIncome - summary.totalExpenses,
      ),
      netIncome: roundCurrency(
        summary.totalIncome - summary.pendingIncome - summary.totalExpenses,
      ),
    }

    const report: FinanceOverviewReport = {
      timeframe: {
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      },
      summary,
      history,
      incomeByCategory: mapToEntries(incomeCategories),
      expenseByCategory: mapToEntries(expenseCategories),
      dre,
    }

    return NextResponse.json(createApiResponse(report))
  } catch (error) {
    return handleApiError<FinanceOverviewReport>(error)
  }
}
