import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api/utils"
import type { ApiResponse, PatientSearchResult } from "@/app/types/patient"

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PatientSearchResult[]>>> {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!query.trim()) {
      return NextResponse.json(createApiResponse([], "Query de busca é obrigatória"))
    }

    if (limit > 50) {
      return NextResponse.json(createApiResponse([], "Limite máximo de 50 resultados"), { status: 400 })
    }

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        birthDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(
      createApiResponse(patients, `${patients.length} pacientes encontrados`),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
