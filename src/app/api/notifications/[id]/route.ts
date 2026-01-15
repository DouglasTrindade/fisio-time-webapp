import { type NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  createApiError,
  createApiResponse,
  handleApiError,
} from "@/lib/api/utils"
import { NotificationStatus } from "@prisma/client"
import { mapNotificationToApp } from "@/app/(protected)/notificacoes/mapper"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 401 })
    }

    const { id } = await context.params
    if (!id) {
      return NextResponse.json(createApiError("Notificação inválida"), {
        status: 400,
      })
    }

    const existing = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, recipientId: true, status: true },
    })

    if (!existing) {
      return NextResponse.json(createApiError("Notificação não encontrada"), {
        status: 404,
      })
    }

    if (existing.recipientId !== session.user.id) {
      return NextResponse.json(createApiError("Acesso negado"), { status: 403 })
    }

    let updated
    if (existing.status === NotificationStatus.READ) {
      updated = await prisma.notification.findUnique({
        where: { id },
        include: { sender: true, recipient: true },
      })
    } else {
      await prisma.$executeRaw`
        UPDATE "notifications"
        SET status = 'read',
            read_at = NOW()
        WHERE id = ${id}
      `

      updated = await prisma.notification.findUnique({
        where: { id },
        include: { sender: true, recipient: true },
      })
    }

    if (!updated) {
      return NextResponse.json(createApiError("Notificação não encontrada"), {
        status: 404,
      })
    }

    return NextResponse.json(
      createApiResponse(
        mapNotificationToApp(updated),
        "Notificação atualizada com sucesso",
      ),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
