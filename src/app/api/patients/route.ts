import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPatientSchema } from "./validation"
import {
  createApiResponse,
  createApiError,
  handleApiError,
  getPaginationParams,
  validateJsonBody,
} from "@/lib/api/utils"
import type { ApiResponse, PaginatedResponse, Patient } from "@/types/patient"

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PaginatedResponse<Patient>>>> {
  try {
    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request)

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(createApiError("Parâmetros de paginação inválidos"), { status: 400 })
    }

    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const validSortFields = ["name", "createdAt", "phone", "email"]
    const orderBy = validSortFields.includes(sortBy) ? { [sortBy]: sortOrder } : { createdAt: "desc" as const }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.patient.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    const paginatedResponse: PaginatedResponse<Patient> = {
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }

    return NextResponse.json(createApiResponse(paginatedResponse, "Pacientes listados com sucesso"))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Patient>>> {
  try {
    const body = await validateJsonBody(request, createPatientSchema)

    const existingPatient = await prisma.patient.findFirst({
      where: { phone: body.phone },
    })

    if (existingPatient) {
      return NextResponse.json(createApiError("Já existe um paciente com este telefone"), { status: 409 })
    }

    const patient = await prisma.patient.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(createApiResponse(patient, "Paciente criado com sucesso"), { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
