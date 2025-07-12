import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "./validation";
import {
  createApiResponse,
  createApiError,
  handleApiError,
  getPaginationParams,
  validateJsonBody,
} from "@/lib/api/utils";

import type { ApiResponse, PaginatedResponse, Appointment } from "@/app/utils/types/appointment";

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
      data: appointments,
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
    const body = await validateJsonBody(request, createAppointmentSchema);

    const appointment = await prisma.appointment.create({
      data: {
        name: body.name,
        phone: body.phone,
        date: new Date(body.date),
        status: body.status || "waiting" ,
        notes: body.notes || null,
        patientId: body.patientId || null,
      },
    });

    return NextResponse.json(
      createApiResponse(appointment, "Agendamento criado com sucesso"),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
