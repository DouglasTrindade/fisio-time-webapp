import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "./validation";
import {
  createApiError,
  createApiResponse,
  getPaginationParams,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils";
import type {
  Appointment,
  AppointmentCreateInput,
  PaginatedResponse,
  ApiResponse,
} from "@/app/utils/types/appointment";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<Appointment>>>> {
  try {
    const { page, limit, search, sortBy, sortOrder } =
      getPaginationParams(request);

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        createApiError("Parâmetros de paginação inválidos"),
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const validSortFields = ["date", "name", "createdAt", "status"];
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { date: "asc" as const };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.appointment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const paginatedResponse: PaginatedResponse<Appointment> = {
      data: appointments.map((a) => ({
        ...a,
        date: a.date.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
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
      createApiResponse(paginatedResponse, "Agendamentos listados com sucesso")
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Appointment>>> {
  try {
    const body = await validateJsonBody<AppointmentCreateInput>(
      request,
      createAppointmentSchema
    );

    const appointment = await prisma.appointment.create({
      data: {
        name: body.name || "",
        phone: body.phone,
        date: new Date(body.date),
        status: body.status || "waiting",
        notes: body.notes ?? null,
        patientId: body.patientId ?? null,
      },
    });

    return NextResponse.json(
      createApiResponse(
        {
          ...appointment,
          date: appointment.date.toISOString(),
          createdAt: appointment.createdAt.toISOString(),
          updatedAt: appointment.updatedAt.toISOString(),
        },
        "Agendamento criado com sucesso"
      ),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
