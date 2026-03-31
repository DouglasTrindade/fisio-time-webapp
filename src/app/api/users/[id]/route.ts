import { NextResponse, type NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { z } from "zod"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  createApiError,
  createApiResponse,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils"
import { canManageUsers } from "@/lib/auth/permissions"

const updateUserSchema = z.object({
  name: z.string().min(1, "Informe o nome").optional(),
  email: z.string().email("Informe um e-mail válido").optional(),
  role: z.nativeEnum(Role).optional(),
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres").optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user || !canManageUsers(session.user.role)) {
      return NextResponse.json(
        createApiError("Você não tem permissão para editar usuários."),
        { status: 403 },
      )
    }

    const { id } = await params
    const data = await validateJsonBody(request, updateUserSchema)

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        createApiError("Nenhum dado foi enviado para atualização."),
        { status: 400 },
      )
    }

    const updatePayload: {
      name?: string
      email?: string
      role?: Role
      password?: string
    } = { ...data }

    if (data.password) {
      updatePayload.password = await bcrypt.hash(data.password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatePayload,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      createApiResponse(updatedUser, "Usuário atualizado com sucesso"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user || !canManageUsers(session.user.role)) {
      return NextResponse.json(
        createApiError("Você não tem permissão para excluir usuários."),
        { status: 403 },
      )
    }

    const { id } = await params

    if (session.user.id === id) {
      return NextResponse.json(
        createApiError("Você não pode excluir o próprio usuário."),
        { status: 400 },
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      createApiResponse(null, "Usuário excluído com sucesso"),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
