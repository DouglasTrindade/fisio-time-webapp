import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchema, normalizeAppointmentStatus } from "./schema";
import {
  createApiError,
  createApiResponse,
  getPaginationParams,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils";
import type { ApiResponse, RecordsResponse } from "@/app/types/api";
import { Status, type Appointment as PrismaAppointment } from "@prisma/client";

type Appointment = Omit<
  PrismaAppointment,
  "date" | "createdAt" | "updatedAt"
> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RecordsResponse<Appointment>>>> {
  try {
    const { page, limit, search, sortBy, sortOrder } =
      getPaginationParams(request);

    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date"); // formato esperado YYYY-MM-DD

    let dateFilter: { date?: { gte: Date; lt: Date } } = {};
    if (dateParam) {
      // tenta montar intervalo do dia UTC
      const start = new Date(dateParam + "T00:00:00.000Z");
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      if (!isNaN(start.getTime())) {
        dateFilter = { date: { gte: start, lt: end } };
      }
    }

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json<ApiResponse<RecordsResponse<Appointment>>>(
        createApiError("Parâmetros de paginação inválidos"),
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const textWhere = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const where = { ...textWhere, ...dateFilter };

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

    const responseBody: RecordsResponse<Appointment> = {
      records: appointments.map((a) => ({
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
      createApiResponse(responseBody, "Agendamentos listados com sucesso")
    );
  } catch (error) {
    return handleApiError<RecordsResponse<Appointment>>(error);
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Appointment>>> {
  try {
    const body = await validateJsonBody(
      request,
      createAppointmentSchema
    );

    const normalizedStatus = normalizeAppointmentStatus(body.status) ?? Status.WAITING;

    const appointment = await prisma.appointment.create({
      data: {
        name: body.name || "",
        phone: body.phone,
        date: new Date(body.date),
        status: normalizedStatus,
        notes: body.notes ?? null,
        patientId: body.patientId ?? null,
        professionalId: body.professionalId,
      },
    });

    return NextResponse.json(
      createApiResponse<Appointment>(
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
    return handleApiError<Appointment>(error);
  }
}
