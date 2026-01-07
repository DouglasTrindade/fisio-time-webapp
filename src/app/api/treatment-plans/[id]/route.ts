import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  treatmentPlanParamsSchema,
  updateTreatmentPlanSchema,
} from "../schema";
import {
  createApiError,
  createApiResponse,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils";
import type { ApiResponse } from "@/app/types/api";
import type { TreatmentPlan } from "@/app/types/treatment-plan";
import { AttendanceType } from "@prisma/client";

const sanitizeText = (value?: string | null) => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
};

const treatmentPlanInclude = {
  patient: {
    select: {
      id: true,
      name: true,
    },
  },
  attendance: {
    select: {
      id: true,
      date: true,
      type: true,
      patientId: true,
      mainComplaint: true,
    },
  },
};

const validateAttendanceForPlan = async (
  attendanceId: string,
  patientId: string,
  currentPlanId?: string
) => {
  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    select: {
      id: true,
      type: true,
      patientId: true,
    },
  });

  if (!attendance) {
    return createApiError<TreatmentPlan>("Avaliação não encontrada");
  }

  if (attendance.type !== AttendanceType.EVALUATION) {
    return createApiError<TreatmentPlan>(
      "Somente avaliações podem receber plano de tratamento"
    );
  }

  if (attendance.patientId !== patientId) {
    return createApiError<TreatmentPlan>(
      "Avaliação não pertence ao paciente informado"
    );
  }

  const existing = await prisma.treatmentPlan.findUnique({
    where: { attendanceId },
  });

  if (existing && existing.id !== currentPlanId) {
    return createApiError<TreatmentPlan>(
      "Esta avaliação já possui um plano de tratamento"
    );
  }

  return null;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<TreatmentPlan>>> {
  try {
    const params = await context.params;
    const { id } = treatmentPlanParamsSchema.parse(params);

    const treatmentPlan = await prisma.treatmentPlan.findUnique({
      where: { id },
      include: treatmentPlanInclude,
    });

    if (!treatmentPlan) {
      return NextResponse.json(
        createApiError("Plano de tratamento não encontrado"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createApiResponse(treatmentPlan, "Plano de tratamento encontrado")
    );
  } catch (error) {
    return handleApiError<TreatmentPlan>(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<TreatmentPlan>>> {
  try {
    const params = await context.params;
    const { id } = treatmentPlanParamsSchema.parse(params);
    const body = await validateJsonBody(request, updateTreatmentPlanSchema);

    const existingPlan = await prisma.treatmentPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return NextResponse.json(
        createApiError("Plano de tratamento não encontrado"),
        { status: 404 }
      );
    }

    let patientIdToUpdate: string | undefined;
    let attendanceIdToUpdate: string | undefined;

    if (body.attendanceId && body.attendanceId !== existingPlan.attendanceId) {
      const targetPatientId = body.patientId ?? existingPlan.patientId;
      const attendanceError = await validateAttendanceForPlan(
        body.attendanceId,
        targetPatientId,
        existingPlan.id
      );

      if (attendanceError) {
        return NextResponse.json(attendanceError, { status: 400 });
      }

      patientIdToUpdate = targetPatientId;
      attendanceIdToUpdate = body.attendanceId;
    } else if (
      body.patientId &&
      body.patientId !== existingPlan.patientId
    ) {
      return NextResponse.json(
        createApiError("Para alterar o paciente selecione uma nova avaliação"),
        { status: 400 }
      );
    }

    const updatedPlan = await prisma.treatmentPlan.update({
      where: { id },
      data: {
        patientId: patientIdToUpdate ?? undefined,
        attendanceId: attendanceIdToUpdate ?? undefined,
        procedure: body.procedure ?? undefined,
        sessionQuantity: body.sessionQuantity ?? undefined,
        resource: body.resource !== undefined ? sanitizeText(body.resource) : undefined,
        conducts: body.conducts !== undefined ? sanitizeText(body.conducts) : undefined,
        objectives:
          body.objectives !== undefined
            ? sanitizeText(body.objectives)
            : undefined,
        prognosis:
          body.prognosis !== undefined ? sanitizeText(body.prognosis) : undefined,
      },
      include: treatmentPlanInclude,
    });

    return NextResponse.json(
      createApiResponse(
        updatedPlan,
        "Plano de tratamento atualizado com sucesso"
      )
    );
  } catch (error) {
    return handleApiError<TreatmentPlan>(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const params = await context.params;
    const { id } = treatmentPlanParamsSchema.parse(params);

    const existingPlan = await prisma.treatmentPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return NextResponse.json(
        createApiError("Plano de tratamento não encontrado"),
        { status: 404 }
      );
    }

    await prisma.treatmentPlan.delete({
      where: { id },
    });

    return NextResponse.json(
      createApiResponse(null, "Plano de tratamento excluído com sucesso")
    );
  } catch (error) {
    return handleApiError<null>(error);
  }
}
