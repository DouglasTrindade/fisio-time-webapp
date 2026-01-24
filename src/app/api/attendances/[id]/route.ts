import { type NextRequest, NextResponse } from "next/server";
import { AttendanceType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toPrismaEnumValue } from "@/lib/prisma/enum-helpers";
import {
  createApiResponse,
  createApiError,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils";
import {
  attendanceParamsSchema,
  updateAttendanceSchema,
} from "../schema";
import type { ApiResponse } from "@/types/api";
import type { Attendance } from "@/types/attendance";
import {
  attendanceInclude,
  formatAttendance,
  toPrismaAttendanceType,
  buildUpdateFinanceData,
  syncAttendanceTransaction,
  deleteAttendanceTransaction,
  type AttendanceWithRelations,
} from "../utils";
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

const resolveAttendanceType = (
  raw: unknown,
): Prisma.AttendanceType | undefined => {
  const typeInput =
    typeof raw === "string"
      ? raw
      : typeof raw === "object" && raw !== null && "value" in raw
        ? (raw as { value?: string }).value
        : undefined
  return normalizeAttendanceTypeForDb(typeInput)
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Attendance>>> {
  try {
    const session = await auth();
    if (!session?.user || !canManageClinical(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), {
        status: 403,
      });
    }

    const { id } = attendanceParamsSchema.parse(await context.params);

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: attendanceInclude,
    });

    if (!attendance) {
      return NextResponse.json(
        createApiError<Attendance>("Atendimento não encontrado"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createApiResponse<Attendance>(
        formatAttendance(attendance as AttendanceWithRelations)
      )
    );
  } catch (error) {
    return handleApiError<Attendance>(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Attendance>>> {
  try {
    const session = await auth();
    if (!session?.user || !canManageClinical(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), {
        status: 403,
      });
    }

    const { id } = attendanceParamsSchema.parse(await context.params);
    const body = await validateJsonBody(request, updateAttendanceSchema);

    const existing = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        createApiError<Attendance>("Atendimento não encontrado"),
        { status: 404 }
      );
    }

    const prismaType = resolveAttendanceType(body.type);
    const financeData = buildUpdateFinanceData(body);
    if (process.env.NODE_ENV !== "production") {
      console.debug("[attendances] update finance payload", financeData);
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        ...(body.patientId
          ? { patient: { connect: { id: body.patientId } } }
          : {}),
        ...(body.professionalId
          ? { professional: { connect: { id: body.professionalId } } }
          : {}),
        type: prismaType,
        date: body.date ? new Date(body.date) : undefined,
        mainComplaint:
          body.mainComplaint !== undefined ? body.mainComplaint : undefined,
        currentIllnessHistory:
          body.currentIllnessHistory !== undefined
            ? body.currentIllnessHistory
            : undefined,
        pastMedicalHistory:
          body.pastMedicalHistory !== undefined
            ? body.pastMedicalHistory
            : undefined,
        familyHistory:
          body.familyHistory !== undefined ? body.familyHistory : undefined,
        observations:
          body.observations !== undefined ? body.observations : undefined,
        cidCode: body.cidCode !== undefined ? body.cidCode : undefined,
        cidDescription:
          body.cidDescription !== undefined ? body.cidDescription : undefined,
        cifCode: body.cifCode !== undefined ? body.cifCode : undefined,
        cifDescription:
          body.cifDescription !== undefined ? body.cifDescription : undefined,
        evolutionNotes:
          body.evolutionNotes !== undefined ? body.evolutionNotes : undefined,
        attachments:
          body.attachments !== undefined ? body.attachments : undefined,
        ...financeData,
      },
      include: attendanceInclude,
    });

    await syncAttendanceTransaction(updated as AttendanceWithRelations);

    return NextResponse.json(
      createApiResponse<Attendance>(
        formatAttendance(updated as AttendanceWithRelations),
        "Atendimento atualizado com sucesso"
      )
    );
  } catch (error) {
    return handleApiError<Attendance>(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await auth();
    if (!session?.user || !canManageClinical(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), {
        status: 403,
      });
    }

    const { id } = attendanceParamsSchema.parse(await context.params);

    const existing = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        createApiError<null>("Atendimento não encontrado"),
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.treatmentPlan.deleteMany({
        where: { attendanceId: id },
      });

      await tx.attendance.delete({ where: { id } });
    });

    await deleteAttendanceTransaction(id);

    return NextResponse.json(
      createApiResponse<null>(null, "Atendimento excluído com sucesso")
    );
  } catch (error) {
    return handleApiError<null>(error);
  }
}
