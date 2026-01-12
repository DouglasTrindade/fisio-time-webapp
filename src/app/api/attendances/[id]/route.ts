import { type NextRequest, NextResponse } from "next/server";
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
  type AttendanceWithRelations,
} from "../utils";

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

    const typeInput =
      typeof body.type === "string"
        ? body.type
        : typeof body.type === "object" && body.type !== null && "value" in body.type
          ? (body.type as { value?: string }).value
          : undefined;
    const prismaType = typeInput ? toPrismaAttendanceType(typeInput) : undefined;

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        patientId: body.patientId ?? undefined,
        professionalId: body.professionalId ?? undefined,
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

    await prisma.attendance.delete({ where: { id } });

    return NextResponse.json(
      createApiResponse<null>(null, "Atendimento excluído com sucesso")
    );
  } catch (error) {
    return handleApiError<null>(error);
  }
}
