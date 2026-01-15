import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AttendanceType as PrismaAttendanceType } from "@prisma/client";
import { PatientShow } from "./_components";
import type { HistoryEntry, ProfessionalOption } from "./_components/types";

interface HistoryPageProps {
  params: Promise<{ id: string }>;
}

const PatientHistoryPage = async ({ params }: HistoryPageProps) => {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      gender: true,
      birthDate: true,
      maritalStatus: true,
      profession: true,
      notes: true,
      createdAt: true,
    },
  });

  if (!patient) {
    notFound();
  }

  const attendances = await prisma.attendance.findMany({
    where: { patientId: id },
    orderBy: { date: "desc" },
    include: {
      professional: {
        select: {
          id: true,
          name: true,
        },
      },
      treatmentPlan: {
        select: {
          id: true,
        },
      },
    },
  });

  const entries: HistoryEntry[] = attendances.map((attendance) => {
    const type =
      attendance.type === PrismaAttendanceType.EVALUATION ? "evaluation" : "evolution";
    const title =
      type === "evaluation"
        ? attendance.mainComplaint ?? "Avaliação clínica"
        : attendance.cidDescription ??
        attendance.cidCode ??
        "Evolução registrada";
    const summary =
      type === "evaluation"
        ? attendance.observations ??
        attendance.currentIllnessHistory ??
        attendance.pastMedicalHistory ??
        ""
        : attendance.evolutionNotes ?? attendance.observations ?? "";

    return {
      id: attendance.id,
      type,
      date: attendance.date.toISOString(),
      professionalId: attendance.professionalId,
      professionalName: attendance.professional?.name ?? "Não informado",
      title,
      summary,
      cidCode: attendance.cidCode,
      cidDescription: attendance.cidDescription,
      cifCode: attendance.cifCode,
      cifDescription: attendance.cifDescription,
      hasTreatmentPlan: Boolean(attendance.treatmentPlan),
    };
  });

  const uniqueProfessionals: ProfessionalOption[] = Array.from(
    new Map(
      attendances
        .filter((attendance) => attendance.professional)
        .map((attendance) => [
          attendance.professional!.id,
          {
            id: attendance.professional!.id,
            name: attendance.professional!.name ?? "Profissional",
          },
        ]),
    ).values(),
  );

  return (
    <PatientShow
      patient={{
        id: patient.id,
        name: patient.name ?? "Paciente sem nome",
        phone: patient.phone,
        email: patient.email,
        gender: patient.gender,
        birthDate: patient.birthDate?.toISOString() ?? null,
        maritalStatus: patient.maritalStatus,
        profession: patient.profession,
        notes: patient.notes,
        createdAt: patient.createdAt.toISOString(),
      }}
      entries={entries}
      professionals={uniqueProfessionals}
    />
  );
};

export default PatientHistoryPage;
