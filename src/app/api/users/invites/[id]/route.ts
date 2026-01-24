import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canInviteUsers } from "@/lib/auth/permissions"
import { createApiError, createApiResponse, handleApiError } from "@/lib/api/utils"
import type { ApiResponse } from "@/types/api"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(
  _request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth()
    if (!session?.user || !canInviteUsers(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const { id } = await context.params

    const invite = await prisma.userInvite.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!invite) {
      return NextResponse.json(createApiError("Convite não encontrado"), { status: 404 })
    }

    await prisma.userInvite.delete({ where: { id } })

    return NextResponse.json(createApiResponse(null, "Convite cancelado"))
  } catch (error) {
    return handleApiError(error)
  }
}
