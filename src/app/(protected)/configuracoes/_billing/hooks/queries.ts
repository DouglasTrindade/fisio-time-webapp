"use client"

import { useQuery } from "@tanstack/react-query"

import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { BillingInvoice, BillingPaymentMethod, BillingSummary } from "@/types/billing"

const fetcher = async <T,>(endpoint: string) => {
  const response = await apiRequest<ApiResponse<T>>(endpoint)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Não foi possível carregar os dados")
  }
  return response.data
}

export const billingKeys = {
  summary: () => ["billing", "summary"] as const,
  paymentMethods: () => ["billing", "payment-methods"] as const,
  invoices: () => ["billing", "invoices"] as const,
}

export const useBillingSummary = () =>
  useQuery({
    queryKey: billingKeys.summary(),
    queryFn: () => fetcher<BillingSummary>("/billing/subscription"),
  })

export const useBillingPaymentMethods = () =>
  useQuery({
    queryKey: billingKeys.paymentMethods(),
    queryFn: () => fetcher<BillingPaymentMethod[]>("/billing/payment-methods"),
  })

export const useBillingInvoices = () =>
  useQuery({
    queryKey: billingKeys.invoices(),
    queryFn: () => fetcher<BillingInvoice[]>("/billing/invoices"),
  })
