import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createApiError,
  createApiResponse,
  handleApiError,
} from "@/lib/api/utils";
import { patientParamsSchema } from "../../validation";
import {
  createHistorySchema,
} from "../../history/validation";
import {
  parseHistoryRequest,
  uploadHistoryAttachment,
} from "../../history/utils";
import type { CreateHistoryInput } from "../../history/validation";

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

    return NextResponse.json(
      createApiResponse(history, `${history.length} registros encontrados`),
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
    const data = createHistorySchema.parse({
      ...payload,
      kind: payload.kind?.toUpperCase?.() ?? "EVOLUTION",
    });

    let attachment: { path: string; url: string } | null = null;
    if (file && file.size > 0) {
      attachment = await uploadHistoryAttachment(id, file);
    }

    const historyEntry = await prisma.patientHistory.create({
      data: {
        patientId: id,
        kind: data.kind,
        cidCode: data.cidCode ?? null,
        cidDescription: data.cidDescription ?? null,
        content: data.content,
        attachmentUrl: attachment?.url,
        attachmentPath: attachment?.path,
      },
    });

    return NextResponse.json(
      createApiResponse(historyEntry, "Evolução registrada com sucesso"),
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
