import { type NextRequest, NextResponse } from "next/server";
import { AttendanceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
  type AttendanceWithRelations,
} from "../utils";

const resolveAttendanceType = (
  raw: unknown,
): AttendanceType | undefined => {
  const typeInput =
    typeof raw === "string"
      ? raw
      : typeof raw === "object" && raw !== null && "value" in raw
        ? (raw as { value?: string }).value
        : undefined
  return typeInput ? toPrismaAttendanceType(typeInput) : undefined
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Attendance>>> {
  try {
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

    return NextResponse.json(
      createApiResponse<null>(null, "Atendimento excluído com sucesso")
    );
  } catch (error) {
    return handleApiError<null>(error);
  }
}
