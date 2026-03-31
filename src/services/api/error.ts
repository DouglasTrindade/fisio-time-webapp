"use client"

import axios from "axios"
import type { ApiResponse } from "@/types/api"

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined
    const message = data?.error || data?.message
    if (typeof message === "string" && message.trim().length > 0) {
      return message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
