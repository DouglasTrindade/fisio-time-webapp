import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updatePatientSchema, patientParamsSchema } from "../validation"
import { createApiResponse, createApiError, handleApiError, validateJsonBody } from "@/lib/api/utils"
import type { ApiResponse, Patient } from "@/types/patient"

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse<Patient>>> {
  try {
    const { id } = patientParamsSchema.parse(params)

    const patient = await prisma.patient.findUnique({
      where: { id },
    })

    if (!patient) {
      return NextResponse.json(createApiError("Paciente não encontrado"), { status: 404 })
    }

    return NextResponse.json(createApiResponse(patient, "Paciente encontrado"))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse<Patient>>> {
  try {
    const { id } = patientParamsSchema.parse(params)
    const body = await validateJsonBody(request, updatePatientSchema)

    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    })

    if (!existingPatient) {
      return NextResponse.json(createApiError("Paciente não encontrado"), { status: 404 })
    }

    if (body.phone && body.phone !== existingPatient.phone) {
      const phoneExists = await prisma.patient.findFirst({
        where: {
          phone: body.phone,
          id: { not: id },
        },
      })

      if (phoneExists) {
        return NextResponse.json(createApiError("Já existe um paciente com este telefone"), { status: 409 })
      }
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.phone && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email || null }),
        ...(body.birthDate !== undefined && {
          birthDate: body.birthDate ? new Date(body.birthDate) : null,
        }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
      },
    })

    return NextResponse.json(createApiResponse(updatedPatient, "Paciente atualizado com sucesso"))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = patientParamsSchema.parse(params)

    const existingPatient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: true,
      },
    })

    if (!existingPatient) {
      return NextResponse.json(createApiError("Paciente não encontrado"), { status: 404 })
    }

    if (existingPatient.appointments.length > 0) {
      return NextResponse.json(createApiError("Não é possível excluir paciente com agendamentos"), { status: 409 })
    }

    await prisma.patient.delete({
      where: { id },
    })

    return NextResponse.json(createApiResponse(null, "Paciente excluído com sucesso"))
  } catch (error) {
    return handleApiError(error)
  }
}
