import { type NextRequest, NextResponse } from "next/server"
import {
  eachDayOfInterval,
  endOfDay,
  formatISO,
  startOfDay,
  subDays,
  differenceInYears,
} from "date-fns"

import { prisma } from "@/lib/prisma"
import {
  createApiError,
  createApiResponse,
  handleApiError,
} from "@/lib/api/utils"
import type { ApiResponse } from "@/app/types/api"
import type { PatientAttendanceReport } from "@/app/types/reports"

type GenderKey = "masculino" | "feminino" | "outro" | "naoInformado"

const GENDER_LABELS: Record<GenderKey, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  naoInformado: "Não informado",
}

const AGE_GROUPS = [
  { label: "0-10", min: 0, max: 10 },
  { label: "11-20", min: 11, max: 20 },
  { label: "21-30", min: 21, max: 30 },
  { label: "31-40", min: 31, max: 40 },
  { label: "41-50", min: 41, max: 50 },
  { label: "51-60", min: 51, max: 60 },
  { label: "60+", min: 61, max: Number.POSITIVE_INFINITY },
] as const

const DEFAULT_RANGE_DAYS = 30

const getGenderKey = (value?: string | null): GenderKey => {
  if (!value) {
    return "naoInformado"
  }

  const normalized = value.toLowerCase().trim()
  if (["masculino", "m", "male"].includes(normalized)) {
    return "masculino"
  }
  if (["feminino", "f", "female"].includes(normalized)) {
    return "feminino"
  }

  return "outro"
}

const getAgeGroupLabel = (age: number | null): string => {
  if (typeof age !== "number" || Number.isNaN(age)) {
    return "Não informado"
  }

  const group = AGE_GROUPS.find(
    (entry) => age >= entry.min && age <= entry.max,
  )
  return group?.label ?? "Não informado"
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PatientAttendanceReport>>> {
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
      return NextResponse.json(
        createApiError("Período inválido informado."),
        { status: 400 },
      )
    }

    if (startDate > endDate) {
      return NextResponse.json(
        createApiError("A data inicial deve ser menor que a final."),
        { status: 400 },
      )
    }

    const [attendances, totalPatients, patientsRegisteredInPeriod, appointmentsInPeriod] =
      await Promise.all([
        prisma.attendance.findMany({
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                gender: true,
                birthDate: true,
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        }),
        prisma.patient.count(),
        prisma.patient.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.appointment.count({
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ])

    const seriesBuckets = new Map<
      string,
      { evaluations: number; evolutions: number; total: number }
    >()
    const dailyPatients = new Map<string, Set<string>>()
    const patientMap = new Map<
      string,
      { id: string; name: string; birthDate: Date | null; count: number }
    >()
    const genderCounts: Record<GenderKey, number> = {
      masculino: 0,
      feminino: 0,
      outro: 0,
      naoInformado: 0,
    }

    const ageGenderMap = new Map<
      string,
      { masculino: number; feminino: number; outro: number; naoInformado: number }
    >()

    AGE_GROUPS.forEach((group) => {
      ageGenderMap.set(group.label, {
        masculino: 0,
        feminino: 0,
        outro: 0,
        naoInformado: 0,
      })
    })
    ageGenderMap.set("Não informado", {
      masculino: 0,
      feminino: 0,
      outro: 0,
      naoInformado: 0,
    })

    attendances.forEach((attendance) => {
      const dayKey = formatISO(attendance.date, { representation: "date" })
      const bucket =
        seriesBuckets.get(dayKey) ?? {
          evaluations: 0,
          evolutions: 0,
          total: 0,
        }
      if (attendance.type === "EVALUATION") {
        bucket.evaluations += 1
      } else {
        bucket.evolutions += 1
      }
      bucket.total += 1
      seriesBuckets.set(dayKey, bucket)

      const set = dailyPatients.get(dayKey) ?? new Set<string>()
      set.add(attendance.patientId)
      dailyPatients.set(dayKey, set)

      if (attendance.patient) {
        const existing =
          patientMap.get(attendance.patientId) ??
          {
            id: attendance.patient.id,
            name: attendance.patient.name ?? "Paciente sem nome",
            birthDate: attendance.patient.birthDate ?? null,
            count: 0,
          }
        existing.count += 1
        patientMap.set(attendance.patientId, existing)

        const genderKey = getGenderKey(attendance.patient.gender)
        genderCounts[genderKey] += 1

        const age = attendance.patient.birthDate
          ? differenceInYears(new Date(), attendance.patient.birthDate)
          : null
        const ageLabel = getAgeGroupLabel(age)
        const ageEntry = ageGenderMap.get(ageLabel)
        if (ageEntry) {
          ageEntry[genderKey] += 1
        }
      }
    })

    const days = eachDayOfInterval({
      start: startDate,
      end: endDate,
    })

    const series = days.map((day) => {
      const key = formatISO(day, { representation: "date" })
      const bucket = seriesBuckets.get(key) ?? {
        evaluations: 0,
        evolutions: 0,
        total: 0,
      }
      const patientsInDay = dailyPatients.get(key)?.size ?? 0

      return {
        date: key,
        evaluations: bucket.evaluations,
        evolutions: bucket.evolutions,
        total: bucket.total,
        averagePerPatient:
          patientsInDay > 0 ? Number((bucket.total / patientsInDay).toFixed(2)) : 0,
      }
    })

    const totalAttendances = attendances.length
    const evaluations = attendances.filter((item) => item.type === "EVALUATION").length
    const evolutions = totalAttendances - evaluations
    const uniquePatients = patientMap.size

    const report: PatientAttendanceReport = {
      timeframe: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary: {
        totalPatients,
        patientsRegisteredInPeriod,
        attendedPatients: uniquePatients,
        totalAttendances,
        evaluations,
        evolutions,
        averagePerDay:
          days.length > 0 ? Number((totalAttendances / days.length).toFixed(2)) : 0,
        averagePerPatient:
          uniquePatients > 0
            ? Number((totalAttendances / uniquePatients).toFixed(2))
            : 0,
        appointmentsInPeriod,
      },
      series,
      genderDistribution: (Object.keys(genderCounts) as GenderKey[]).map((key) => ({
        label: GENDER_LABELS[key],
        value: genderCounts[key],
      })),
      ageGender: Array.from(ageGenderMap.entries()).map(([range, values]) => ({
        range,
        ...values,
      })),
      patients: Array.from(patientMap.values())
        .sort((a, b) => b.count - a.count)
        .map((patient) => ({
          id: patient.id,
          name: patient.name,
          age: patient.birthDate
            ? differenceInYears(new Date(), patient.birthDate)
            : null,
          attendances: patient.count,
        })),
    }

    return NextResponse.json(createApiResponse(report))
  } catch (error) {
    return handleApiError(error)
  }
}
