import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

import { prisma } from "@/lib/prisma"
import {
  createApiError,
  createApiResponse,
  getPaginationParams,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils"
import type { ApiResponse, RecordsResponse } from "@/types/api"
import type { AppNotification } from "@/types/notification"
import {
  NotificationCategory,
  NotificationPriority,
  NotificationSendMode,
  NotificationStatus,
  Prisma,
} from "@prisma/client"
import { createNotificationSchema } from "./schema"
import { mapNotificationToApp } from "@/app/(protected)/notificacoes/mapper"

const scopeParam = (value: string | null): "received" | "sent" =>
  value === "sent" ? "sent" : "received"

const toNotificationCategory = (value: string | null) => {
  if (!value || value === "all") return undefined

  switch (value) {
    case "system":
      return NotificationCategory.SYSTEM
    case "finance":
      return NotificationCategory.FINANCE
    case "attendance":
      return NotificationCategory.ATTENDANCE
    case "message":
      return NotificationCategory.MESSAGE
    default:
      return undefined
  }
}

const toNotificationStatus = (value: string | null) => {
  if (!value || value === "all") return undefined
  return value === "read" ? NotificationStatus.READ : NotificationStatus.UNREAD
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<RecordsResponse<AppNotification>>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 401 })
    }

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request)
    const url = new URL(request.url)
    const scope = scopeParam(url.searchParams.get("scope"))
    const statusFilter = toNotificationStatus(url.searchParams.get("status"))
    const categoryFilter = toNotificationCategory(url.searchParams.get("category"))

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(createApiError("Parâmetros inválidos"), {
        status: 400,
      })
    }

    const skip = (page - 1) * limit
    const now = new Date()

    const baseWhere: Prisma.NotificationWhereInput =
      scope === "sent"
        ? { senderId: session.user.id }
        : { recipientId: session.user.id }

    const where: Prisma.NotificationWhereInput = {
      ...baseWhere,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { message: { contains: search, mode: "insensitive" } },
            ],
          }
        : null),
      ...(statusFilter ? { status: statusFilter } : null),
      ...(categoryFilter ? { category: categoryFilter } : null),
    }

    if (scope !== "sent") {
      where.AND = [
        ...(where.AND ?? []),
        {
          OR: [{ scheduledFor: null }, { scheduledFor: { lte: now } }],
        },
      ]
    }

    const validSortFields = ["sentAt", "createdAt"]
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { sentAt: "desc" as const }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          sender: true,
          recipient: true,
        },
      }),
      prisma.notification.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      createApiResponse<RecordsResponse<AppNotification>>(
        {
          records: notifications.map(mapNotificationToApp),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        "Notificações listadas com sucesso",
      ),
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<AppNotification>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 401 })
    }

    const data = await validateJsonBody(request, createNotificationSchema)

    if (data.recipientId === session.user.id) {
      return NextResponse.json(
        createApiError("Selecione outro destinatário"),
        { status: 400 },
      )
    }

    const scheduledDate =
      data.sendMode === "scheduled" && data.scheduledFor
        ? new Date(data.scheduledFor)
        : null

    if (scheduledDate && Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json(createApiError("Data programada inválida"), {
        status: 400,
      })
    }

    const notification = await prisma.notification.create({
      data: {
        title:
          data.title?.trim() ||
          `Mensagem de ${session.user.name ?? "Profissional"}`,
        message: data.message.trim(),
        channel: "Mensagens",
        highlight: false,
        includeEmail: data.includeEmail ?? false,
        scheduledFor: scheduledDate,
        sentAt: scheduledDate ?? new Date(),
        recipientId: data.recipientId,
        senderId: session.user.id,
      },
      include: {
        sender: true,
        recipient: true,
      },
    })

    return NextResponse.json(
      createApiResponse(
        mapNotificationToApp(notification),
        "Notificação registrada com sucesso",
      ),
      { status: 201 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
