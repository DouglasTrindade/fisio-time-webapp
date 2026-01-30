"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export const formatBillingDate = (value?: string) => {
  if (!value) return "—"
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR })
}
