import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createApiResponse, handleApiError } from "@/lib/api/utils";
import type { ApiResponse } from "@/app/types/patient";

interface PatientStats {
  total: number;
  thisMonth: number;
  thisWeek: number;
  withEmail: number;
  withoutEmail: number;
  averageAge?: number;
}

export async function GET(): Promise<NextResponse<ApiResponse<PatientStats>>> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const [
      total,
      thisMonth,
      thisWeek,
      withEmail,
      withoutEmail,
      patientsWithBirthDate,
    ] = await Promise.all([
      prisma.patient.count(),

      prisma.patient.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),

      prisma.patient.count({
        where: {
          createdAt: { gte: startOfWeek },
        },
      }),

      prisma.patient.count({
        where: {
          email: { not: null },
        },
      }),

      prisma.patient.count({
        where: {
          email: null,
        },
      }),

      prisma.patient.findMany({
        where: {
          birthDate: { not: null },
        },
        select: {
          birthDate: true,
        },
      }),
    ]);

    let averageAge: number | undefined;
    if (patientsWithBirthDate.length > 0) {
      const ages = patientsWithBirthDate.map((patient) => {
        const birthDate = new Date(patient.birthDate!);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age;
      });

      averageAge = Math.round(
        ages.reduce((sum, age) => sum + age, 0) / ages.length
      );
    }

    const stats: PatientStats = {
      total,
      thisMonth,
      thisWeek,
      withEmail,
      withoutEmail,
      averageAge,
    };

    return NextResponse.json(
      createApiResponse(stats, "Estatísticas obtidas com sucesso")
    );
  } catch (error) {
    return handleApiError(error);
  }
}
