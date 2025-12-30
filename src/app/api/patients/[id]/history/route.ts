import { NextRequest, NextResponse } from "next/server";
import type { HistoryKind as PrismaHistoryKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createApiError,
  createApiResponse,
  handleApiError,
} from "@/lib/api/utils";
import { patientParamsSchema } from "../../validation";
import {
  createHistorySchema,
  type HistoryKindValue,
} from "../../history/validation";
import {
  parseHistoryRequest,
  uploadHistoryAttachment,
} from "../../history/utils";
import type { CreateHistoryInput } from "../../history/validation";

const toPrismaKind = (kind: HistoryKindValue): PrismaHistoryKind =>
  kind === "assessment" ? "ASSESSMENT" : "EVOLUTION";

const fromPrismaKind = (kind: PrismaHistoryKind): HistoryKindValue =>
  kind === "ASSESSMENT" ? "assessment" : "evolution";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const { id } = patientParamsSchema.parse(params);

    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json(createApiError("Paciente não encontrado"), {
        status: 404,
      });
    }

    const history = await prisma.patientHistory.findMany({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
    });

    const normalizedHistory = history.map((entry) => ({
      ...entry,
      kind: fromPrismaKind(entry.kind),
    }));

    return NextResponse.json(
      createApiResponse(normalizedHistory, `${normalizedHistory.length} registros encontrados`),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const { id } = patientParamsSchema.parse(params);

    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json(createApiError("Paciente não encontrado"), {
        status: 404,
      });
    }

    const { payload, file } = await parseHistoryRequest<CreateHistoryInput>(request);
    const data = createHistorySchema.parse(payload);

    let attachment: { path: string; url: string } | null = null;
    if (file && file.size > 0) {
      attachment = await uploadHistoryAttachment(id, file);
    }

    const prismaKind = toPrismaKind(data.kind);

    const resolvedContent =
      data.kind === "assessment"
        ? data.assessmentObservations ?? data.content ?? "Avaliação registrada"
        : data.content ?? "Evolução registrada";

    const historyEntry = await prisma.patientHistory.create({
      data: {
        patientId: id,
        kind: prismaKind,
        cidCode: data.kind === "evolution" ? data.cidCode ?? null : null,
        cidDescription:
          data.kind === "evolution" ? data.cidDescription ?? null : null,
        content: resolvedContent,
        attachmentUrl: attachment?.url,
        attachmentPath: attachment?.path,
        assessmentMainComplaint:
          data.kind === "assessment"
            ? data.assessmentMainComplaint ?? null
            : null,
        assessmentDiseaseHistory:
          data.kind === "assessment"
            ? data.assessmentDiseaseHistory ?? null
            : null,
        assessmentMedicalHistory:
          data.kind === "assessment"
            ? data.assessmentMedicalHistory ?? null
            : null,
        assessmentFamilyHistory:
          data.kind === "assessment"
            ? data.assessmentFamilyHistory ?? null
            : null,
        assessmentObservations:
          data.kind === "assessment"
            ? data.assessmentObservations ?? resolvedContent
            : null,
      },
    });

    const normalizedEntry = {
      ...historyEntry,
      kind: fromPrismaKind(historyEntry.kind),
    };

    return NextResponse.json(
      createApiResponse(normalizedEntry, "Evolução registrada com sucesso"),
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
