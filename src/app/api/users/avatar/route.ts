import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import {
  createApiError,
  createApiResponse,
  handleApiError,
} from "@/lib/api/utils";
import type { ApiResponse } from "@/lib/api/types";

const AVATAR_BUCKET = "avatars";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createApiError("Não autorizado"), {
        status: 401,
      });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        createApiError("Supabase não configurado corretamente"),
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(createApiError("Arquivo inválido"), {
        status: 400,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = file.name?.split(".").pop() ?? "png";
    const filePath = `${session.user.id}/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, buffer, {
        cacheControl: "3600",
        contentType: file.type || "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("[AvatarUpload] uploadError:", uploadError);
      return NextResponse.json(
        createApiError(
          uploadError.message || "Erro ao fazer upload do avatar"
        ),
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: publicUrl },
    });

    return NextResponse.json(
      createApiResponse({ url: publicUrl }, "Avatar atualizado com sucesso")
    );
  } catch (error) {
    return handleApiError(error);
  }
}
