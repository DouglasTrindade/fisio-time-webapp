import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAttendanceSchema } from "./schema";
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
  type AttendanceWithRelations,
} from "./utils";

const resolveAttendanceType = (
  raw: unknown,
  fallback: AttendanceType = AttendanceType.EVALUATION,
): AttendanceType => {
  const typeInput =
    typeof raw === "string"
      ? raw
      : typeof raw === "object" && raw !== null && "value" in raw
        ? (raw as { value?: string }).value
        : undefined

  return toPrismaAttendanceType(typeInput) ?? fallback
}

const parseFinanceAmount = (value?: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") return null
  const normalized = String(value).trim()
  if (!normalized) return null
  return new Prisma.Decimal(normalized)
}

const parseFinanceDate = (value?: unknown) => {
  if (typeof value !== "string" || !value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RecordsResponse<Attendance>>>> {
  try {
    const { page, limit, search, sortBy, sortOrder } =
      getPaginationParams(request);
    const url = new URL(request.url);
    const typeParam = url.searchParams.get("type");
    const patientId = url.searchParams.get("patientId") || "";
    const prismaFilterType = toPrismaAttendanceType(typeParam);

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
      ...(prismaFilterType ? { type: prismaFilterType } : {}),
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
        launchToFinance: body.launchToFinance ?? false,
        financeAmount: parseFinanceAmount(body.financeAmount),
        financePaymentMethod: body.financePaymentMethod ?? null,
        financeAccount: body.financeAccount ?? null,
        financePaid: body.financePaid ?? false,
        financePaidAt: parseFinanceDate(body.financePaidAt),
      },
      include: attendanceInclude,
    });

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
