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
import bcrypt from "bcryptjs";

const updateUserSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    email: z.string().email("Informe um e-mail válido"),
    image: z.string().url("Informe uma URL válida").optional().or(z.literal("")),
    currentPassword: z.string().min(1, "Informe a senha atual").optional(),
    password: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres").optional(),
  })
  .refine((data) => {
    if (!data.password) return true;
    return Boolean(data.currentPassword);
  }, {
    message: "Informe a senha atual para alterar a senha",
    path: ["currentPassword"],
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(createApiError("Usuário não encontrado"), {
        status: 404,
      });
    }

    if (data.password) {
      if (!user.password) {
        return NextResponse.json(createApiError("Senha atual não configurada"), {
          status: 400,
        });
      }
      const isValid = await bcrypt.compare(data.currentPassword ?? "", user.password);
      if (!isValid) {
        return NextResponse.json(createApiError("Senha atual inválida"), {
          status: 400,
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
        image: data.image ? data.image : null,
        password: data.password ? await bcrypt.hash(data.password, 10) : undefined,
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
