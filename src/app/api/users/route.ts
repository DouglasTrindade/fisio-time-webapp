import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { z } from "zod"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  createApiError,
  createApiResponse,
  getPaginationParams,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils"
import { canManageUsers, canCreateUsers } from "@/lib/auth/permissions"
import type { ApiResponse, RecordsResponse } from "@/types/api"
import type { UserProfile } from "@/types/user"

const selectUserFields = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  createdAt: true,
} as const

const baseUserSchema = z.object({
  name: z.string().min(1, "Informe o nome do usuário"),
  email: z.string().email("Informe um e-mail válido"),
  role: z.nativeEnum(Role, { required_error: "Selecione uma função" }),
})

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres"),
})

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<RecordsResponse<UserProfile>>>> {
  try {
    const session = await auth()
    if (!session?.user || !canManageUsers(session.user.role)) {
      return NextResponse.json(
        createApiError("Você não tem permissão para visualizar usuários."),
        { status: 403 },
      )
    }

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request)

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        createApiError("Parâmetros de paginação inválidos"),
        { status: 400 },
      )
    }

    const skip = (page - 1) * limit

    const where =
      search.trim().length > 0
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : undefined

    const validSortFields = ["name", "email", "createdAt"]
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" as const }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: selectUserFields,
      }),
      prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    const responseBody: RecordsResponse<UserProfile> = {
      records: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }

    return NextResponse.json(
      createApiResponse(responseBody, "Usuários listados com sucesso"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<UserProfile>>> {
  try {
    const session = await auth()
    if (!session?.user || !canCreateUsers(session.user.role)) {
      return NextResponse.json(
        createApiError("Você não tem permissão para criar usuários."),
        { status: 403 },
      )
    }

    const payload = await validateJsonBody(request, createUserSchema)
    const hashedPassword = await bcrypt.hash(payload.password, 10)

    const createdUser = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        password: hashedPassword,
      },
      select: selectUserFields,
    })

    return NextResponse.json(
      createApiResponse(createdUser, "Usuário criado com sucesso"),
      { status: 201 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
