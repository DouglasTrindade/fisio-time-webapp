import { type NextRequest, NextResponse } from "next/server"
import { ZodError, type ZodSchema } from "zod"
import type { ApiResponse } from "./types"

export function createApiResponse<T>(data?: T, message?: string, success = true): ApiResponse<T> {
  return {
    success,
    data,
    message,
  }
}

export function createApiError(error: string, message?: string): ApiResponse {
  return {
    success: false,
    error,
    message,
  }
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error("API Error:", error)

  if (error instanceof ZodError) {
    return NextResponse.json(createApiError("Dados inválidos", error.errors[0]?.message), { status: 400 })
  }

  if (error instanceof Error) {
    const status = (error as any).status || 500
    return NextResponse.json(createApiError(error.message), { status })
  }

  return NextResponse.json(createApiError("Erro interno do servidor"), { status: 500 })
}

export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  return {
    page: Number.parseInt(searchParams.get("page") || "1"),
    limit: Number.parseInt(searchParams.get("limit") || "10"),
    search: searchParams.get("search") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
  }
}

export async function validateJsonBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body) as T
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("JSON inválido")
    }
    throw error
  }
}
