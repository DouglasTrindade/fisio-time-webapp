"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import type {
  PatientCreateInput,
  PatientUpdateInput,
  PatientFilters,
  PaginatedResponse,
  Patient,
} from "@/app/types/patient"

export async function createPatient(data: PatientCreateInput) {
  try {
    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        birthDate: data.birthDate || null,
        notes: data.notes || null,
      },
    })

    revalidatePath("/patients")
    return { success: true, data: patient }
  } catch (error) {
    console.error("Erro ao criar paciente:", error)
    return { success: false, error: "Erro ao criar paciente" }
  }
}

export async function updatePatient(data: PatientUpdateInput) {
  try {
    const { id, ...updateData } = data

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...updateData,
        email: updateData.email || null,
        birthDate: updateData.birthDate || null,
        notes: updateData.notes || null,
      },
    })

    revalidatePath("/patients")
    return { success: true, data: patient }
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error)
    return { success: false, error: "Erro ao atualizar paciente" }
  }
}

export async function deletePatient(id: string) {
  try {
    await prisma.patient.delete({
      where: { id },
    })

    revalidatePath("/patients")
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar paciente:", error)
    return { success: false, error: "Erro ao deletar paciente" }
  }
}

export async function getPatients(filters: PatientFilters = {}): Promise<PaginatedResponse<Patient>> {
  try {
    const { search = "", page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = filters

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

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.patient.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
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
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error)
    throw new Error("Erro ao buscar pacientes")
  }
}

export async function getPatientById(id: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
    })

    return { success: true, data: patient }
  } catch (error) {
    console.error("Erro ao buscar paciente:", error)
    return { success: false, error: "Erro ao buscar paciente" }
  }
}
