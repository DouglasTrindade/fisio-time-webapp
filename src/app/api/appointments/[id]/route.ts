import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createApiResponse,
  createApiError,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils";
import { updateAppointmentSchema, appointmentParamsSchema } from "../validation";
import type { Appointment, ApiResponse } from "@/app/utils/types/appointment";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Appointment>>> {
  try {
    const { id } = appointmentParamsSchema.parse(await context.params);

    const appointment = await prisma.appointment.findUnique({ where: { id } });

    if (!appointment) {
      return NextResponse.json(createApiError("Agendamento não encontrado"), {
        status: 404,
      });
    }

    return NextResponse.json(
      createApiResponse({
        ...appointment,
        date: appointment.date.toISOString(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      })
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Appointment>>> {
  try {
    const { id } = appointmentParamsSchema.parse(await context.params);
    const body = await validateJsonBody(request, updateAppointmentSchema);

    const existing = await prisma.appointment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(createApiError("Agendamento não encontrado"), {
        status: 404,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        phone: body.phone ?? undefined,
        date: body.date ? new Date(body.date) : undefined,
        status: body.status ?? undefined,
        notes: body.notes ?? undefined,
        patientId: body.patientId ?? undefined,
      },
    });

    return NextResponse.json(
      createApiResponse({
        ...updated,
        date: updated.date.toISOString(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }, "Agendamento atualizado com sucesso")
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = appointmentParamsSchema.parse(await context.params);

    const existing = await prisma.appointment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(createApiError("Agendamento não encontrado"), {
        status: 404,
      });
    }

    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json(createApiResponse(null, "Agendamento excluído com sucesso"));
  } catch (error) {
    return handleApiError(error);
  }
}
