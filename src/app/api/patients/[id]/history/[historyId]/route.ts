import { NextRequest, NextResponse } from "next/server";
import type { HistoryKind as PrismaHistoryKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createApiError,
  createApiResponse,
  handleApiError,
} from "@/lib/api/utils";
import {
  historyParamsSchema,
  updateHistorySchema,
  type HistoryKindValue,
} from "../../../history/validation";
import type { UpdateHistoryInput } from "../../../history/validation";
import {
  deleteHistoryAttachment,
  parseHistoryRequest,
  uploadHistoryAttachment,
} from "../../../history/utils";

const toPrismaKind = (kind: HistoryKindValue): PrismaHistoryKind =>
  kind === "assessment" ? "ASSESSMENT" : "EVOLUTION";

const fromPrismaKind = (kind: PrismaHistoryKind): HistoryKindValue =>
  kind === "ASSESSMENT" ? "assessment" : "evolution";

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

    const data = updateHistorySchema.parse(payload);

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

    const nextKind = data.kind ?? fromPrismaKind(existing.kind);
    const prismaNextKind = toPrismaKind(nextKind);
    const resolvedContent =
      nextKind === "assessment"
        ? data.assessmentObservations ??
          data.content ??
          existing.assessmentObservations ??
          existing.content
        : data.content ?? existing.content;

    const updated = await prisma.patientHistory.update({
      where: { id: historyId },
      data: {
        kind: prismaNextKind,
        cidCode:
          nextKind === "evolution"
            ? data.cidCode ?? existing.cidCode
            : null,
        cidDescription:
          nextKind === "evolution"
            ? data.cidDescription ?? existing.cidDescription
            : null,
        content: resolvedContent,
        attachmentUrl,
        attachmentPath,
        assessmentMainComplaint:
          nextKind === "assessment"
            ? data.assessmentMainComplaint ?? existing.assessmentMainComplaint
            : null,
        assessmentDiseaseHistory:
          nextKind === "assessment"
            ? data.assessmentDiseaseHistory ?? existing.assessmentDiseaseHistory
            : null,
        assessmentMedicalHistory:
          nextKind === "assessment"
            ? data.assessmentMedicalHistory ??
              existing.assessmentMedicalHistory
            : null,
        assessmentFamilyHistory:
          nextKind === "assessment"
            ? data.assessmentFamilyHistory ?? existing.assessmentFamilyHistory
            : null,
        assessmentObservations:
          nextKind === "assessment"
            ? data.assessmentObservations ??
              existing.assessmentObservations ??
              resolvedContent
            : null,
      },
    });

    return NextResponse.json(
      createApiResponse(
        { ...updated, kind: fromPrismaKind(updated.kind) },
        "Registro atualizado com sucesso",
      ),
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
