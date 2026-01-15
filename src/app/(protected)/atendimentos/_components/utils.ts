"use client"

import type { AttendanceType } from "@/types/attendance"

const typeLabels: Record<string, string> = {
  evaluation: "Avaliação",
  evolution: "Evolução",
}

const safeDate = (isoDate: string) => {
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime()) ? null : date
}

export const getAttendanceTypeLabel = (type: AttendanceType) => {
  const key = type.toLowerCase()
  return typeLabels[key] ?? "Atendimento"
}

export const formatAttendanceDate = (isoDate: string) => {
  const date = safeDate(isoDate)
  if (!date) return "-"

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export const formatAttendanceTime = (isoDate: string) => {
  const date = safeDate(isoDate)
  if (!date) return "-"

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export const paymentMethods = [
  { slug: "pix", name: "Pix" },
  { slug: "credit_card", name: "Cartão de Crédito" },
  { slug: "bank_slip", name: "Boleto Bancário" },
] as const

export type PaymentMethodOption = (typeof paymentMethods)[number]
export type PaymentMethodSlug = PaymentMethodOption["slug"]

export const DEFAULT_PAYMENT_METHOD: PaymentMethodSlug = "pix"

export const isPaymentMethodSlug = (value: string): value is PaymentMethodSlug =>
  paymentMethods.some((method) => method.slug === value)

export const normalizePaymentMethodSlug = (
  input: unknown,
  fallback: PaymentMethodSlug = DEFAULT_PAYMENT_METHOD,
): PaymentMethodSlug => {
  const normalized = String(input ?? "")
    .trim()
    .toLowerCase()

  return isPaymentMethodSlug(normalized) ? normalized : fallback
}
