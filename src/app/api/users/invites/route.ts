import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import { addDays } from "date-fns"

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
import type { UserInviteSummary } from "@/types/user"
import { canInviteUsers } from "@/lib/auth/permissions"

const inviteSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  role: z.enum(["ADMIN", "PROFESSIONAL", "ASSISTANT"]),
})

const inviteSelect = {
  id: true,
  email: true,
  role: true,
  token: true,
  createdAt: true,
  expiresAt: true,
  acceptedAt: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<RecordsResponse<UserInviteSummary>>>> {
  try {
    const session = await auth()
    if (!session?.user || !canInviteUsers(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const { page, limit, search } = getPaginationParams(request)

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(createApiError("Parâmetros inválidos"), { status: 400 })
    }

    const where = {
      acceptedAt: null,
      ...(search.trim().length
        ? { email: { contains: search, mode: "insensitive" as const } }
        : {}),
    }

    const skip = (page - 1) * limit

    const [invites, total] = await Promise.all([
      prisma.userInvite.findMany({
        where,
        select: inviteSelect,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.userInvite.count({ where }),
    ])

    const responseBody: RecordsResponse<UserInviteSummary> = {
      records: invites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }

    return NextResponse.json(
      createApiResponse(responseBody, "Convites carregados com sucesso"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<UserInviteSummary>>> {
  try {
    const session = await auth()
    if (!session?.user || !canInviteUsers(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const payload = await validateJsonBody(request, inviteSchema)
    const normalizedEmail = payload.email.toLowerCase()

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        createApiError("Este e-mail já possui acesso"),
        { status: 409 },
      )
    }

    await prisma.userInvite.deleteMany({
      where: { email: normalizedEmail, acceptedAt: null },
    })

    const invite = await prisma.userInvite.create({
      data: {
        email: normalizedEmail,
        role: payload.role,
        token: randomUUID(),
        createdById: session.user.id,
        expiresAt: addDays(new Date(), 7),
      },
      select: inviteSelect,
    })

    return NextResponse.json(
      createApiResponse(invite, "Convite gerado com sucesso"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
