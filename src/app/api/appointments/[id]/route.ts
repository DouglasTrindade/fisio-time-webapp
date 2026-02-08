import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createApiResponse,
  createApiError,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils";
import {
  updateAppointmentSchema,
  appointmentParamsSchema,
  normalizeAppointmentStatus,
} from "../schema";
import type { Appointment, ApiResponse } from "@/types/appointment";
import type { Status } from "@prisma/client";

const professionalSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

const mapAppointmentResponse = (
  appointment: {
    id: string;
    name: string;
    phone: string;
    date: Date;
    status: Status;
    professionalId: string;
    createdAt: Date;
    updatedAt: Date;
    patientId: string | null;
    notes: string | null;
    User?: { id: string; name: string | null; email: string | null; image: string | null } | null;
  } | null,
) => {
  if (!appointment) return null;
  const { User, ...rest } = appointment;
  return {
    ...rest,
    date: appointment.date.toISOString(),
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    status: appointment.status,
    professional: User
      ? {
          id: User.id,
          name: User.name,
          email: User.email,
          image: User.image,
        }
      : null,
  };
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Appointment>>> {
  try {
    const { id } = appointmentParamsSchema.parse(await context.params);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        User: { select: professionalSelect },
      },
    });

    if (!appointment) {
      return NextResponse.json<ApiResponse<Appointment>>(
        createApiError<Appointment>("Agendamento não encontrado"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createApiResponse<Appointment>(mapAppointmentResponse(appointment)!),
    );
  } catch (error) {
    return handleApiError<Appointment>(error);
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
      return NextResponse.json<ApiResponse<Appointment>>(
        createApiError<Appointment>("Agendamento não encontrado"),
        { status: 404 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        phone: body.phone ?? undefined,
        date: body.date ? new Date(body.date) : undefined,
        status: normalizeAppointmentStatus(body.status) ?? undefined,
        notes: body.notes ?? undefined,
        patientId: body.patientId ?? undefined,
      },
      include: {
        User: { select: professionalSelect },
      },
    });

    return NextResponse.json(
      createApiResponse<Appointment>(
        mapAppointmentResponse(updated)!,
        "Agendamento atualizado com sucesso",
      ),
    );
  } catch (error) {
    return handleApiError<Appointment>(error);
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
      return NextResponse.json<ApiResponse<null>>(
        createApiError<null>("Agendamento não encontrado"),
        { status: 404 }
      );
    }

    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json(
      createApiResponse<null>(null, "Agendamento excluído com sucesso")
    );
  } catch (error) {
    return handleApiError<null>(error);
  }
}
