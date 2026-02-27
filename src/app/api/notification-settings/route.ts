import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createApiError, createApiResponse, handleApiError, validateJsonBody } from "@/lib/api/utils"
import type { ApiResponse } from "@/types/api"
import { notificationSettingsSchema } from "./schema"
import { Prisma } from "@prisma/client"

type NotificationSettingsResponse = {
  preference: "all" | "direct" | "none"
  emailCommunication: boolean
  emailMarketing: boolean
  emailSocial: boolean
  emailSecurity: boolean
}

const defaultSettings: NotificationSettingsResponse = {
  preference: "all",
  emailCommunication: true,
  emailMarketing: false,
  emailSocial: true,
  emailSecurity: false,
}

const isMissingNotificationSettingsTable = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2021" &&
  String(error.meta?.table ?? "").includes("notification_settings")

export async function GET(): Promise<NextResponse<ApiResponse<NotificationSettingsResponse>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 401 })
    }

    const tableCheck = await prisma.$queryRaw<
      Array<{ exists: string | null }>
    >`SELECT to_regclass('public.notification_settings')::text AS exists`
    if (!tableCheck[0]?.exists) {
      return NextResponse.json(
        createApiError(
          "Tabela notification_settings não existe. Rode as migrations para habilitar as configurações de notificações.",
        ),
        { status: 409 },
      )
    }

    const settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id },
      select: {
        preference: true,
        emailCommunication: true,
        emailMarketing: true,
        emailSocial: true,
        emailSecurity: true,
      },
    })

    return NextResponse.json(
      createApiResponse(
        settings ?? defaultSettings,
        "Configurações de notificações carregadas",
      ),
    )
  } catch (error) {
    if (isMissingNotificationSettingsTable(error)) {
      return NextResponse.json(
        createApiError(
          "Tabela notification_settings não existe. Rode as migrations para habilitar as configurações de notificações.",
        ),
        { status: 409 },
      )
    }
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<NotificationSettingsResponse>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 401 })
    }

    const tableCheck = await prisma.$queryRaw<
      Array<{ exists: string | null }>
    >`SELECT to_regclass('public.notification_settings')::text AS exists`
    if (!tableCheck[0]?.exists) {
      return NextResponse.json(
        createApiError(
          "Tabela notification_settings não existe. Rode as migrations para habilitar as configurações de notificações.",
        ),
        { status: 409 },
      )
    }

    const data = await validateJsonBody(request, notificationSettingsSchema)

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data,
      },
      update: {
        ...data,
      },
      select: {
        preference: true,
        emailCommunication: true,
        emailMarketing: true,
        emailSocial: true,
        emailSecurity: true,
      },
    })

    return NextResponse.json(
      createApiResponse(
        settings,
        "Configurações de notificações atualizadas",
      ),
    )
  } catch (error) {
    if (isMissingNotificationSettingsTable(error)) {
      return NextResponse.json(
        createApiError(
          "Tabela notification_settings não existe. Rode as migrations para habilitar as configurações de notificações.",
        ),
        { status: 409 },
      )
    }
    return handleApiError(error)
  }
}
