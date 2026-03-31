"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { MoveRight } from "lucide-react"
import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"

type BreadcrumbItem = {
  raw: string
  label: string
  isCurrent: boolean
}

type ResourceConfig = {
  endpoint: string
  getLabel: (data: Record<string, unknown>) => string | undefined
}

const SEGMENT_LABELS: Record<string, string> = {
  pacientes: "Pacientes",
  agendamentos: "Agendamentos",
  atendimentos: "Atendimentos",
  tratamentos: "Tratamentos",
  configuracoes: "Configurações",
  notificacoes: "Notificações",
  resumo: "Resumo",
  relatorios: "Relatórios",
  usuarios: "Usuários",
  dashboard: "Dashboard",
}

const toLabel = (segment: string) =>
  SEGMENT_LABELS[segment] ?? segment.replace(/-/g, " ")

const RESOURCE_CONFIG: Record<string, ResourceConfig> = {
  pacientes: {
    endpoint: "/patients",
    getLabel: (data) => (data.name as string | undefined) ?? undefined,
  },
  atendimentos: {
    endpoint: "/attendances",
    getLabel: (data) =>
      (data.patient as { name?: string | null } | null)?.name ?? undefined,
  },
  tratamentos: {
    endpoint: "/treatment-plans",
    getLabel: (data) =>
      (data.patient as { name?: string | null } | null)?.name ??
      (data.procedure as string | undefined),
  },
  usuarios: {
    endpoint: "/users",
    getLabel: (data) => (data.name as string | undefined) ?? undefined,
  },
  agendamentos: {
    endpoint: "/appointments",
    getLabel: (data) => (data.name as string | undefined) ?? undefined,
  },
}

export const Breadcrumbs = () => {
  const pathname = usePathname()
  const [resourceLabels, setResourceLabels] = useState<Record<string, string>>({})

  const visibleSegments = useMemo(
    () => pathname.split("/").filter((segment) => segment.length > 0),
    [pathname],
  )

  useEffect(() => {
    const actions = new Set(["novo", "editar", "edit", "new"])

    const candidates = visibleSegments.flatMap((segment, index) => {
      const next = visibleSegments[index + 1]
      if (!next || actions.has(next)) return []
      if (!RESOURCE_CONFIG[segment]) return []
      return [{ resource: segment, id: next }]
    })

    if (candidates.length === 0) return

    let isActive = true
    candidates.forEach(({ resource, id }) => {
      const cacheKey = `${resource}:${id}`
      if (resourceLabels[cacheKey]) return

      const config = RESOURCE_CONFIG[resource]
      apiRequest<ApiResponse<Record<string, unknown>>>(`${config.endpoint}/${id}`)
        .then((response) => {
          if (!isActive) return
          const rawLabel = response.data ? config.getLabel(response.data) : undefined
          const label = rawLabel?.trim() || "Detalhes"
          setResourceLabels((prev) => ({
            ...prev,
            [cacheKey]: label,
          }))
        })
        .catch(() => {
          if (!isActive) return
          setResourceLabels((prev) => ({
            ...prev,
            [cacheKey]: "Detalhes",
          }))
        })
    })

    return () => {
      isActive = false
    }
  }, [resourceLabels, visibleSegments])

  const items: BreadcrumbItem[] = useMemo(() => {
    return visibleSegments.map((segment, index) => {
      const isCurrent = index === visibleSegments.length - 1
      const prev = visibleSegments[index - 1]

      let label = toLabel(segment)
      if (prev && RESOURCE_CONFIG[prev]) {
        const cacheKey = `${prev}:${segment}`
        label = resourceLabels[cacheKey] ?? "Detalhes"
      }

      return { raw: segment, label, isCurrent }
    })
  }, [resourceLabels, visibleSegments])

  return (
    <nav className="flex w-full items-center" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li
            key={`${item.raw}-${index}`}
            className="flex items-center capitalize"
            aria-current={item.isCurrent ? "page" : undefined}
          >
            <span className={item.isCurrent ? "text-foreground" : undefined}>
              {item.label}
            </span>
            {index < items.length - 1 ? (
              <MoveRight className="mx-2" size={15} aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
