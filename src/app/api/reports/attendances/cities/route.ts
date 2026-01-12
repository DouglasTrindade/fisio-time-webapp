import { type NextRequest, NextResponse } from "next/server"
import { differenceInCalendarDays, endOfDay, startOfDay, subDays } from "date-fns"

import { prisma } from "@/lib/prisma"
import { createApiError, createApiResponse, handleApiError } from "@/lib/api/utils"
import type { ApiResponse } from "@/types/api"
import type { CitiesAttendanceReport } from "@/types/reports"

const DEFAULT_RANGE_DAYS = 30

const getCityKey = (city?: string | null, state?: string | null) => `${city ?? "Não informado"}|${state ?? ""}`

const formatCityLabel = (key: string) => {
  const [city, state] = key.split("|")
  return state ? `${city}/${state}` : city
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<CitiesAttendanceReport>>> {
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
    const previousPeriodStart = subDays(startDate, totalDays)
    const previousPeriodEnd = subDays(startDate, 1)

    const [attendances, previousAttendances, distinctCities] = await Promise.all([
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
              city: true,
              state: true,
            },
          },
        },
      }),
      prisma.attendance.findMany({
        where: {
          date: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
        },
        include: {
          patient: {
            select: {
              city: true,
              state: true,
            },
          },
        },
      }),
      prisma.patient.groupBy({
        by: ["city", "state"],
        where: {
          city: {
            not: null,
          },
        },
      }),
    ])

    const currentCityMap = new Map<string, { name: string; state: string | null; attendances: number }>()

    attendances.forEach((attendance) => {
      const city = attendance.patient?.city ?? "Não informado"
      const state = attendance.patient?.state ?? null
      const key = getCityKey(city, state)
      const item =
        currentCityMap.get(key) ?? {
          name: city,
          state,
          attendances: 0,
        }
      item.attendances += 1
      currentCityMap.set(key, item)
    })

    const previousCityMap = new Map<string, number>()
    previousAttendances.forEach((attendance) => {
      const city = attendance.patient?.city ?? "Não informado"
      const state = attendance.patient?.state ?? null
      const key = getCityKey(city, state)
      previousCityMap.set(key, (previousCityMap.get(key) ?? 0) + 1)
    })

    const totalAttendances = attendances.length
    const visitedCities = currentCityMap.size

    const cities = Array.from(currentCityMap.values()).sort(
      (a, b) => b.attendances - a.attendances,
    )

    const topCity = cities[0]

    const growthKeys = new Set<string>([
      ...Array.from(currentCityMap.keys()),
      ...Array.from(previousCityMap.keys()),
    ])

    const growth = Array.from(growthKeys).map((key) => {
      const current = currentCityMap.get(key)?.attendances ?? 0
      const previous = previousCityMap.get(key) ?? 0
      let percentage = 0
      if (previous === 0 && current > 0) {
        percentage = 100
      } else if (previous > 0) {
        percentage = Number((((current - previous) / previous) * 100).toFixed(1))
      }

      return {
        name: formatCityLabel(key),
        percentage,
      }
    })

    const citiesWithGrowth = growth.filter((entry) => entry.percentage > 0).length
    const coveragePercentage =
      distinctCities.length === 0
        ? 0
        : Number(Math.min(100, (visitedCities / distinctCities.length) * 100).toFixed(1))

    const data: CitiesAttendanceReport = {
      timeframe: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary: {
        totalAttendances,
        visitedCities,
        topCity: topCity
          ? { name: formatCityLabel(getCityKey(topCity.name, topCity.state)), attendances: topCity.attendances }
          : null,
        averagePerCity: visitedCities > 0 ? Number((totalAttendances / visitedCities).toFixed(1)) : 0,
        citiesWithGrowth,
        coveragePercentage,
      },
      cities,
      growth,
    }

    return NextResponse.json(createApiResponse(data))
  } catch (error) {
    return handleApiError(error)
  }
}
