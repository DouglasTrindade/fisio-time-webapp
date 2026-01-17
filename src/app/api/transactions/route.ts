import { type NextRequest, NextResponse } from "next/server"
import { Prisma, PaymentMethod, TransactionCategory, TransactionSource, TransactionStatus } from "@prisma/client"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  createApiError,
  createApiResponse,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils"
import type { ApiResponse } from "@/types/api"
import { createTransactionSchema, type CreateTransactionInput } from "./schema"

const categoryMap: Record<CreateTransactionInput["category"], TransactionCategory> = {
  attendance: TransactionCategory.ATTENDANCE,
  deposit: TransactionCategory.DEPOSIT,
}

const paymentMethodMap: Record<NonNullable<CreateTransactionInput["paymentMethod"]>, PaymentMethod> = {
  pix: PaymentMethod.PIX,
  bank_slip: PaymentMethod.BANK_SLIP,
  credit_card: PaymentMethod.CREDIT_CARD,
}

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

    await prisma.transaction.create({
      data: {
        description,
        amount,
        account: payload.account?.trim() || null,
        category: categoryMap[payload.category],
        paymentMethod: payload.paymentMethod
          ? paymentMethodMap[payload.paymentMethod]
          : null,
        status: payload.isPaid ? TransactionStatus.PAID : TransactionStatus.PENDING,
        source: TransactionSource.MANUAL,
        referenceId: null,
        attendanceType: null,
        dueDate,
        competenceDate,
        paidAt: payload.isPaid ? dueDate : null,
        notes: payload.notes?.trim() || null,
      },
    })

    return NextResponse.json(
      createApiResponse<null>(null, "Receita registrada com sucesso"),
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("Data")) {
      return NextResponse.json(createApiError(error.message), { status: 400 })
    }
    return handleApiError<null>(error)
  }
}
