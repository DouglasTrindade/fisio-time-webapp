import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTreatmentPlanSchema } from "./schema";
import {
  createApiError,
  createApiResponse,
  getPaginationParams,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils";
import type { ApiResponse, RecordsResponse } from "@/app/types/api";
import type { TreatmentPlan } from "@/app/types/treatment-plan";
import { AttendanceType, type Prisma } from "@prisma/client";

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
    },
  },
} as const;

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RecordsResponse<TreatmentPlan>>>> {
  try {
    const { page, limit, search, sortBy, sortOrder } =
      getPaginationParams(request);
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId") || "";
    const attendanceId = url.searchParams.get("attendanceId") || "";

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        createApiError("Parâmetros de paginação inválidos"),
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    const where: Prisma.TreatmentPlanWhereInput = {
      ...(patientId ? { patientId } : {}),
      ...(attendanceId ? { attendanceId } : {}),
      ...(search
        ? {
            OR: [
              { procedure: { contains: search, mode: "insensitive" } },
              { resource: { contains: search, mode: "insensitive" } },
              { conducts: { contains: search, mode: "insensitive" } },
              { objectives: { contains: search, mode: "insensitive" } },
              { prognosis: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const validSortFields = [
      "createdAt",
      "updatedAt",
      "procedure",
      "sessionQuantity",
    ];
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" as const };

    const [plans, total] = await Promise.all([
      prisma.treatmentPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: treatmentPlanInclude,
      }),
      prisma.treatmentPlan.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const responseBody: RecordsResponse<TreatmentPlan> = {
      records: plans,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return NextResponse.json(
      createApiResponse(
        responseBody,
        "Planos de tratamento listados com sucesso"
      )
    );
  } catch (error) {
    return handleApiError<RecordsResponse<TreatmentPlan>>(error);
  }
}

const ensureAttendanceIsValid = async (
  attendanceId: string,
  patientId: string
) => {
  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    select: {
      id: true,
      patientId: true,
      type: true,
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

  const existingPlan = await prisma.treatmentPlan.findUnique({
    where: { attendanceId },
  });

  if (existingPlan) {
    return createApiError<TreatmentPlan>(
      "Esta avaliação já possui um plano de tratamento"
    );
  }

  return null;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TreatmentPlan>>> {
  try {
    const body = await validateJsonBody(request, createTreatmentPlanSchema);

    const attendanceError = await ensureAttendanceIsValid(
      body.attendanceId,
      body.patientId
    );

    if (attendanceError) {
      return NextResponse.json(attendanceError, {
        status: 400,
      });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: body.patientId },
    });

    if (!patient) {
      return NextResponse.json(
        createApiError("Paciente não encontrado"),
        { status: 404 }
      );
    }

    const treatmentPlan = await prisma.treatmentPlan.create({
      data: {
        patientId: body.patientId,
        attendanceId: body.attendanceId,
        procedure: body.procedure,
        sessionQuantity: body.sessionQuantity,
        resource: sanitizeText(body.resource),
        conducts: sanitizeText(body.conducts),
        objectives: sanitizeText(body.objectives),
        prognosis: sanitizeText(body.prognosis),
      },
      include: treatmentPlanInclude,
    });

    return NextResponse.json(
      createApiResponse(
        treatmentPlan,
        "Plano de tratamento criado com sucesso"
      ),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError<TreatmentPlan>(error);
  }
}
