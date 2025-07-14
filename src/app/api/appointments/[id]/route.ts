import { NextRequest, NextResponse } from "next/server";
import {
  appointmentSchema,
  AppointmentStatus,
} from "@/app/utils/types/appointment";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = appointmentSchema.parse(body);
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
      include: {
        patient: true,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        userId: userId,
        date: new Date(validatedData.date),
        time: validatedData.time,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
        id: {
          not: params.id,
        },
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Já existe um agendamento para este horário" },
        { status: 409 }
      );
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: existingAppointment.patientId },
      data: {
        name: validatedData.patientName,
        phone: validatedData.patientPhone,
        email: validatedData.patientEmail || null,
      },
    });

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        title: `${validatedData.patientName} - Consulta`,
        date: new Date(validatedData.date),
        time: validatedData.time,
        status: validatedData.status,
        notes: validatedData.notes,
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Agendamento cancelado com sucesso" });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
