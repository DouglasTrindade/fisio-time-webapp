import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAttendanceSchema } from "./schema";
import { toPrismaEnumValue } from "@/lib/prisma/enum-helpers";
import {
  createApiResponse,
  createApiError,
  handleApiError,
  getPaginationParams,
  validateJsonBody,
} from "@/lib/api/utils";
import type { ApiResponse, RecordsResponse } from "@/types/api";
import type { Attendance } from "@/types/attendance";
import { AttendanceType, Prisma } from "@prisma/client";
import {
  attendanceInclude,
  formatAttendance,
  toPrismaAttendanceType,
  buildCreateFinanceData,
  syncAttendanceTransaction,
  type AttendanceWithRelations,
} from "./utils";
import { auth } from "@/auth";
import { canManageClinical } from "@/lib/auth/permissions";

const normalizeAttendanceTypeForDb = (
  raw?: string | AttendanceType | null,
): Prisma.AttendanceType | undefined => {
  const parsed = toPrismaAttendanceType(raw)
  return parsed
    ? (toPrismaEnumValue(parsed) as unknown as Prisma.AttendanceType)
    : undefined
}

const DEFAULT_ATTENDANCE_TYPE =
  normalizeAttendanceTypeForDb(AttendanceType.EVALUATION) ??
  (AttendanceType.EVALUATION as unknown as Prisma.AttendanceType)

const resolveAttendanceType = (
  raw: unknown,
  fallback: Prisma.AttendanceType = DEFAULT_ATTENDANCE_TYPE,
): Prisma.AttendanceType => {
  const typeInput =
    typeof raw === "string"
      ? raw
      : typeof raw === "object" && raw !== null && "value" in raw
        ? (raw as { value?: string }).value
        : undefined

  return normalizeAttendanceTypeForDb(typeInput) ?? fallback
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RecordsResponse<Attendance>>>> {
  try {
    const session = await auth();
    if (!session?.user || !canManageClinical(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), {
        status: 403,
      });
    }

    const { page, limit, search, sortBy, sortOrder } =
      getPaginationParams(request);
    const url = new URL(request.url);
    const typeParam = url.searchParams.get("type");
    const patientId = url.searchParams.get("patientId") || "";
    const dbFilterType = normalizeAttendanceTypeForDb(typeParam);

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        createApiError("Parâmetros de paginação inválidos"),
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              {
                patient: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
              {
                professional: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
              {
                mainComplaint: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(dbFilterType ? { type: dbFilterType } : {}),
      ...(patientId ? { patientId } : {}),
    };

    const validSortFields = ["date", "createdAt", "type"];
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { date: "desc" as const };

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: attendanceInclude,
      }),
      prisma.attendance.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const responseBody: RecordsResponse<Attendance> = {
      records: attendances.map((attendance) =>
        formatAttendance(attendance as AttendanceWithRelations)
      ),
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
        "Atendimentos listados com sucesso"
      )
    );
  } catch (error) {
    return handleApiError<RecordsResponse<Attendance>>(error);
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Attendance>>> {
  try {
    const session = await auth();
    if (!session?.user || !canManageClinical(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), {
        status: 403,
      });
    }

    const body = await validateJsonBody(request, createAttendanceSchema);
    const prismaType = resolveAttendanceType(body.type);

    const attendance = await prisma.attendance.create({
      data: {
        patientId: body.patientId,
        professionalId: body.professionalId,
        type: prismaType,
        date: new Date(body.date),
        mainComplaint: body.mainComplaint,
        currentIllnessHistory: body.currentIllnessHistory,
        pastMedicalHistory: body.pastMedicalHistory,
        familyHistory: body.familyHistory,
        observations: body.observations,
        cidCode: body.cidCode ?? null,
        cidDescription: body.cidDescription ?? null,
        cifCode: body.cifCode ?? null,
        cifDescription: body.cifDescription ?? null,
        evolutionNotes: body.evolutionNotes ?? null,
        attachments: body.attachments ?? [],
        ...buildCreateFinanceData(body),
      },
      include: attendanceInclude,
    });

    await syncAttendanceTransaction(attendance as AttendanceWithRelations);

    return NextResponse.json(
      createApiResponse<Attendance>(
        formatAttendance(attendance as AttendanceWithRelations),
        "Atendimento criado com sucesso"
      ),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError<Attendance>(error);
  }
}
