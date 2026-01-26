export type BillingStatusConfig = {
  slug: string
  label: string
  badgeClass: string
}

const STATUS_CONFIGS: BillingStatusConfig[] = [
  { slug: "paid", label: "Pago", badgeClass: "bg-emerald-500/10 text-emerald-400" },
  { slug: "succeeded", label: "Pago", badgeClass: "bg-emerald-500/10 text-emerald-400" },
  { slug: "active", label: "Ativo", badgeClass: "bg-emerald-500/10 text-emerald-400" },
  { slug: "trialing", label: "Período de teste", badgeClass: "bg-blue-500/10 text-blue-400" },
  { slug: "open", label: "Em aberto", badgeClass: "bg-amber-500/10 text-amber-400" },
  { slug: "incomplete", label: "Pendente", badgeClass: "bg-amber-500/10 text-amber-400" },
  { slug: "past_due", label: "Vencido", badgeClass: "bg-amber-500/10 text-amber-400" },
  { slug: "unpaid", label: "Não pago", badgeClass: "bg-rose-500/10 text-rose-400" },
  { slug: "canceled", label: "Cancelado", badgeClass: "bg-muted text-muted-foreground" },
  { slug: "void", label: "Anulado", badgeClass: "bg-muted text-muted-foreground" },
]

export const getBillingStatusConfig = (status?: string): BillingStatusConfig => {
  if (!status) {
    return { slug: "unknown", label: "Desconhecido", badgeClass: "bg-muted text-muted-foreground" }
  }

  return (
    STATUS_CONFIGS.find((config) => config.slug.toLowerCase() === status.toLowerCase()) ?? {
      slug: status,
      label: status,
      badgeClass: "bg-muted text-muted-foreground",
    }
  )
}
