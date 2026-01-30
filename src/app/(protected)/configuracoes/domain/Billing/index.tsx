"use client"

import { SummaryCard } from "./components/SummaryCard"
import { PaymentMethodsSection } from "./components/PaymentMethodsSection"
import { InvoicesSection } from "./components/InvoicesSection"
import {
  useBillingInvoices,
  useBillingPaymentMethods,
  useBillingSummary,
} from "./hooks/queries"

export const BillingView = () => {
  const summaryQuery = useBillingSummary()
  const paymentMethodsQuery = useBillingPaymentMethods()
  const invoicesQuery = useBillingInvoices()

  return (
    <div className="space-y-6">
      <SummaryCard summary={summaryQuery.data} isLoading={summaryQuery.isLoading} />
      <PaymentMethodsSection
        methods={paymentMethodsQuery.data}
        isLoading={paymentMethodsQuery.isLoading}
        isError={paymentMethodsQuery.isError}
      />
      <InvoicesSection
        invoices={invoicesQuery.data}
        isLoading={invoicesQuery.isLoading}
        isError={invoicesQuery.isError}
      />
    </div>
  )
}
