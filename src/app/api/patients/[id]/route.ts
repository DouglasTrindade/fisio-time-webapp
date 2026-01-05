import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePatientSchema, patientParamsSchema } from "../schema";
import {
  createApiResponse,
  createApiError,
  handleApiError,
  validateJsonBody,
} from "@/lib/api/utils";
import type { ApiResponse, Patient } from "@/app/types/patient";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Patient>>> {
  try {
    const params = await context.params;
    const { id } = patientParamsSchema.parse(params);

    const patient = await prisma.patient.findUnique({ where: { id } });

    if (!patient) {
      return NextResponse.json(createApiError("Paciente não encontrado"), {
        status: 404,
      });
    }

    return NextResponse.json(createApiResponse(patient, "Paciente encontrado"));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Patient>>> {
  try {
    const params = await context.params;
    const { id } = patientParamsSchema.parse(params);
    const body = await validateJsonBody(request, updatePatientSchema);

    const existingPatient = await prisma.patient.findUnique({ where: { id } });

    if (!existingPatient) {
      return NextResponse.json(createApiError("Paciente não encontrado"), {
        status: 404,
      });
    }

    if (body.phone && body.phone !== existingPatient.phone) {
      const phoneExists = await prisma.patient.findFirst({
        where: {
          phone: body.phone,
          id: { not: id },
        },
      });

      if (phoneExists) {
        return NextResponse.json(
          createApiError("Já existe um paciente com este telefone"),
          { status: 409 }
        );
      }
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        phone: body.phone ?? undefined,
        email: body.email === "" ? null : body.email,
        birthDate: body.birthDate ?? undefined,
        notes: body.notes === "" ? null : body.notes ?? undefined,
        cpf: body.cpf === "" ? null : body.cpf ?? undefined,
        rg: body.rg === "" ? null : body.rg ?? undefined,
        maritalStatus: body.maritalStatus === "" ? null : body.maritalStatus ?? undefined,
        gender: body.gender === "" ? null : body.gender ?? undefined,
        profession: body.profession === "" ? null : body.profession ?? undefined,
        companyName: body.companyName === "" ? null : body.companyName ?? undefined,
        cep: body.cep === "" ? null : body.cep ?? undefined,
        country: body.country === "" ? null : body.country ?? undefined,
        state: body.state === "" ? null : body.state ?? undefined,
        city: body.city === "" ? null : body.city ?? undefined,
        street: body.street === "" ? null : body.street ?? undefined,
        number: body.number === "" ? null : body.number ?? undefined,
        neighborhood: body.neighborhood === "" ? null : body.neighborhood ?? undefined,
        complement: body.complement === "" ? null : body.complement ?? undefined,
      },
    });

    return NextResponse.json(
      createApiResponse(updatedPatient, "Paciente atualizado com sucesso")
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
    const params = await context.params;
    const { id } = patientParamsSchema.parse(params);

    const existingPatient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: true,
      },
    });

    if (!existingPatient) {
      return NextResponse.json(createApiError("Paciente não encontrado"), {
        status: 404,
      });
    }

    if (existingPatient.appointments.length > 0) {
      return NextResponse.json(
        createApiError("Não é possível excluir paciente com agendamentos"),
        { status: 409 }
      );
    }

    await prisma.patient.delete({ where: { id } });

    return NextResponse.json(
      createApiResponse(null, "Paciente excluído com sucesso")
    );
  } catch (error) {
    return handleApiError(error);
  }
}
