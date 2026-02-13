import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  createApiError,
  createApiResponse,
  getPaginationParams,
  handleApiError,
} from "@/lib/api/utils"
import { canManageUsers } from "@/lib/auth/permissions"
import type { ApiResponse, RecordsResponse } from "@/types/api"
import type { UserProfile } from "@/types/user"

export const selectUserFields = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  createdAt: true,
} as const

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<RecordsResponse<UserProfile>>>> {
  try {
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
    if (!session?.user || !canManageUsers(session.user.role)) {
      return NextResponse.json(
        createApiError("Você não tem permissão para criar usuários."),
        { status: 403 },
      )
    }

    return NextResponse.json(
      createApiError("Criação de usuários apenas por convite."),
      { status: 403 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
