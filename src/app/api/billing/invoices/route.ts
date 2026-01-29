import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { canManageSettings } from "@/lib/auth/permissions"
import { createApiError, createApiResponse, handleApiError } from "@/lib/api/utils"
import { getStripeEnvironment, listStripeInvoices } from "@/lib/stripe"
import type { BillingInvoice } from "@/types/billing"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !canManageSettings(session.user.role)) {
      return NextResponse.json(createApiError("Não autorizado"), { status: 403 })
    }

    const stripeConfig = getStripeEnvironment()
    const invoicesResponse = await listStripeInvoices(stripeConfig, 20)

    const invoices: BillingInvoice[] = invoicesResponse.data.map((invoice) => ({
      id: invoice.id,
      reference: invoice.number || invoice.id,
      status: invoice.status || "open",
      currency: invoice.currency || "brl",
      amount: (invoice.amount_due ?? 0) / 100,
      createdAt: invoice.created ? new Date(invoice.created * 1000).toISOString() : new Date().toISOString(),
      hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
    }))

    return NextResponse.json(createApiResponse(invoices, "Histórico carregado"))
  } catch (error) {
    return handleApiError(error)
  }
}
