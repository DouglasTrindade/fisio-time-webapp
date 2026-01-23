import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createApiError,
  createApiResponse,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils";
import type { ApiResponse } from "@/lib/api/types";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  image: z.string().url("Informe uma URL válida").optional().or(z.literal("")),
});

const selectUserFields = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  createdAt: true,
} as const;

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createApiError("Não autorizado"), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: selectUserFields,
    });

    if (!user) {
      return NextResponse.json(createApiError("Usuário não encontrado"), {
        status: 404,
      });
    }

    return NextResponse.json(
      createApiResponse(user, "Perfil carregado com sucesso")
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createApiError("Não autorizado"), {
        status: 401,
      });
    }

    const data = await validateJsonBody(request, updateUserSchema);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
        image: data.image ? data.image : null,
      },
      select: selectUserFields,
    });

    return NextResponse.json(
      createApiResponse(updatedUser, "Perfil atualizado com sucesso")
    );
  } catch (error) {
    return handleApiError(error);
  }
}
