import { type NextRequest, NextResponse } from "next/server"
import { Prisma, TransactionKind, TransactionSource, TransactionStatus } from "@prisma/client"
import type { PaymentMethod, TransactionCategory } from "@prisma/client"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { toNullablePrismaEnumValue, toPrismaEnumValue } from "@/lib/prisma/enum-helpers"
import {
  createApiError,
  createApiResponse,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils"
import type { ApiResponse } from "@/types/api"
import { createTransactionSchema, type CreateTransactionInput } from "./schema"

const parseDate = (value: string, label: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} inválida`)
  }
  return date
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(createApiError("Não autorizado"), {
        status: 401,
      })
    }

    const payload = await validateJsonBody(request, createTransactionSchema)
    const description = payload.description.trim()
    const amount = new Prisma.Decimal(payload.amount)
    const dueDate = parseDate(payload.dueDate, "Data de vencimento")
    const competenceDate = parseDate(payload.competenceDate, "Data de competência")
    const kind =
      payload.kind === "expense"
        ? TransactionKind.EXPENSE
        : TransactionKind.INCOME
    const expenseCategory = payload.expenseCategory?.trim()
    const incomeCategory = payload.category
      ? (toPrismaEnumValue(payload.category) as TransactionCategory)
      : null

    await prisma.transaction.create({
      data: {
        description,
        amount,
        account: payload.account?.trim() || null,
        category: kind === TransactionKind.INCOME ? incomeCategory : null,
        expenseCategory: kind === TransactionKind.EXPENSE ? expenseCategory || null : null,
        paymentMethod: toNullablePrismaEnumValue(payload.paymentMethod) as PaymentMethod | null,
        status: toPrismaEnumValue(
          payload.isPaid ? TransactionStatus.PAID : TransactionStatus.PENDING,
        ) as TransactionStatus,
        source: toPrismaEnumValue(TransactionSource.MANUAL) as TransactionSource,
        referenceId: null,
        attendanceType: null,
        dueDate,
        competenceDate,
        paidAt: payload.isPaid ? dueDate : null,
        notes: payload.notes?.trim() || null,
        kind: toPrismaEnumValue(kind) as TransactionKind,
      },
    })

    return NextResponse.json(
      createApiResponse<null>(null, "Transação registrada com sucesso"),
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("Data")) {
      return NextResponse.json(createApiError(error.message), { status: 400 })
    }
    return handleApiError<null>(error)
  }
}
