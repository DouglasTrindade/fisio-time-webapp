import { type NextRequest, NextResponse } from "next/server"
import { endOfDay, startOfDay, subDays, differenceInCalendarDays } from "date-fns"

import { prisma } from "@/lib/prisma"
import { AttendanceType } from "@prisma/client"
import { createApiError, createApiResponse, handleApiError } from "@/lib/api/utils"
import type { ApiResponse } from "@/types/api"
import type { ProfessionalsAttendanceReport } from "@/types/reports"

const DEFAULT_RANGE_DAYS = 30

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ProfessionalsAttendanceReport>>> {
  try {
    const { searchParams } = new URL(request.url)
    const endParam = searchParams.get("end")
    const startParam = searchParams.get("start")

    const today = new Date()
    const endDate = endOfDay(endParam ? new Date(endParam) : today)
    const startDate = startOfDay(
      startParam ? new Date(startParam) : subDays(endDate, DEFAULT_RANGE_DAYS - 1),
    )

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(createApiError("Período inválido informado."), {
        status: 400,
      })
    }

    if (startDate > endDate) {
      return NextResponse.json(
        createApiError("A data inicial deve ser menor que a final."),
        { status: 400 },
      )
    }

    const totalDays = Math.max(1, differenceInCalendarDays(endDate, startDate) + 1)

    const [attendances, newProfessionals] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          professional: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ])

    const professionalBuckets = new Map<
      string,
      {
        id: string
        name: string
        attendances: number
        evaluations: number
        evolutions: number
      }
    >()

    let evaluations = 0
    let evolutions = 0

    attendances.forEach((attendance) => {
      const professional = attendance.professional
      if (!professional) {
        return
      }

      const existing =
        professionalBuckets.get(professional.id) ?? {
          id: professional.id,
          name: professional.name ?? "Profissional sem nome",
          attendances: 0,
          evaluations: 0,
          evolutions: 0,
        }

      if (attendance.type === AttendanceType.EVALUATION) {
        existing.evaluations += 1
        evaluations += 1
      } else {
        existing.evolutions += 1
        evolutions += 1
      }

      existing.attendances += 1
      professionalBuckets.set(professional.id, existing)
    })

    const totalAttendances = attendances.length
    const activeProfessionals = professionalBuckets.size

    const data: ProfessionalsAttendanceReport = {
      timeframe: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary: {
        totalAttendances,
        averagePerDay: Number((totalAttendances / totalDays).toFixed(1)),
        activeProfessionals,
        newProfessionals,
        evaluations,
        evolutions,
        averageDuration: null,
      },
      professionals: Array.from(professionalBuckets.values()).sort(
        (a, b) => b.attendances - a.attendances,
      ),
    }

    return NextResponse.json(createApiResponse(data))
  } catch (error) {
    return handleApiError(error)
  }
}
