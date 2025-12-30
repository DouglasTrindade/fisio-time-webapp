import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createApiError,
  createApiResponse,
  handleApiError,
} from "@/lib/api/utils";
import {
  historyParamsSchema,
  updateHistorySchema,
} from "../../../history/validation";
import type { UpdateHistoryInput } from "../../../history/validation";
import {
  deleteHistoryAttachment,
  parseHistoryRequest,
  uploadHistoryAttachment,
} from "../../../history/utils";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; historyId: string }> },
) {
  try {
    const params = await context.params;
    const { id, historyId } = historyParamsSchema.parse(params);

    const existing = await prisma.patientHistory.findUnique({
      where: { id: historyId },
    });

    if (!existing) {
      return NextResponse.json(createApiError("Registro não encontrado"), {
        status: 404,
      });
    }

    const { payload, file } = await parseHistoryRequest<UpdateHistoryInput>(
      request,
    );

    const data = updateHistorySchema.parse({
      ...payload,
      kind: payload.kind?.toUpperCase?.() ?? existing.kind,
    });

    let attachmentUrl = existing.attachmentUrl;
    let attachmentPath = existing.attachmentPath;

    if (file && file.size > 0) {
      await deleteHistoryAttachment(existing.attachmentPath);
      const uploaded = await uploadHistoryAttachment(id, file);
      attachmentUrl = uploaded.url;
      attachmentPath = uploaded.path;
    } else if (payload.attachmentUrl === "") {
      await deleteHistoryAttachment(existing.attachmentPath);
      attachmentUrl = null;
      attachmentPath = null;
    }

    const updated = await prisma.patientHistory.update({
      where: { id: historyId },
      data: {
        kind: data.kind ?? existing.kind,
        cidCode: data.cidCode ?? existing.cidCode,
        cidDescription: data.cidDescription ?? existing.cidDescription,
        content: data.content ?? existing.content,
        attachmentUrl,
        attachmentPath,
      },
    });

    return NextResponse.json(
      createApiResponse(updated, "Registro atualizado com sucesso"),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string; historyId: string }> },
) {
  try {
    const params = await context.params;
    const { historyId } = historyParamsSchema.parse(params);

    const existing = await prisma.patientHistory.findUnique({
      where: { id: historyId },
    });

    if (!existing) {
      return NextResponse.json(createApiError("Registro não encontrado"), {
        status: 404,
      });
    }

    if (existing.attachmentPath) {
      await deleteHistoryAttachment(existing.attachmentPath);
    }

    await prisma.patientHistory.delete({
      where: { id: historyId },
    });

    return NextResponse.json(
      createApiResponse(null, "Registro removido com sucesso"),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
