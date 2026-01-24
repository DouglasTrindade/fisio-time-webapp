import type { AppRole } from "@/types/user"

export type SidebarMenuItemConfig = {
  slug: string
  title: string
  url?: string
  icon?: SidebarIconName
  isSection?: boolean
  disabled?: boolean
  roles?: AppRole[]
  children?: Array<{
    slug: string
    title: string
    url: string
    disabled?: boolean
    roles?: AppRole[]
  }>
}

const sidebarIcons = [
  "layoutDashboard",
  "calendar",
  "users",
  "monitorCheck",
  "briefcaseMedical",
  "circleArrowUp",
  "chartPie",
  "trendingUpDown",
  "settings",
  "chartNoAxesCombined"
] as const

export type SidebarIconName = (typeof sidebarIcons)[number]

const ALL_ROLES: AppRole[] = ["ADMIN", "PROFESSIONAL", "ASSISTANT"]
const STAFF_ROLES: AppRole[] = ["ADMIN", "PROFESSIONAL"]
const ADMIN_ONLY: AppRole[] = ["ADMIN"]

export const menuItems: SidebarMenuItemConfig[] = [
  {
    slug: "section-main-navigation",
    title: "Navegação Principal",
    isSection: true,
  },
  {
    slug: "dashboard",
    title: "Dashboard",
    url: "/dashboard",
    icon: "layoutDashboard",
    roles: ALL_ROLES,
  },
  {
    slug: "appointments",
    title: "Agendamentos",
    url: "/agendamentos",
    icon: "calendar",
    roles: ALL_ROLES,
  },
  {
    slug: "patients",
    title: "Pacientes",
    url: "/pacientes",
    icon: "users",
    roles: ALL_ROLES,
  },
  {
    slug: "services",
    title: "Atendimentos",
    url: "/atendimentos",
    icon: "monitorCheck",
    roles: STAFF_ROLES,
  },
  {
    slug: "treatments",
    title: "Tratamentos",
    url: "/tratamentos",
    icon: "briefcaseMedical",
    roles: STAFF_ROLES,
  },
  {
    slug: "section-finances",
    title: "Financeiro",
    isSection: true,
  },
  {
    slug: "finance-summary",
    title: "Resumo",
    url: "/resumo",
    icon: "trendingUpDown",
    roles: STAFF_ROLES,
  },
  {
    slug: "invoices",
    title: "Notas Fiscais (NFS-e)",
    url: "/notas-fiscais",
    icon: "circleArrowUp",
    disabled: true,
    roles: STAFF_ROLES,
  },
  {
    slug: "section-reports",
    title: "Relatórios",
    isSection: true,
  },
  {
    slug: "services-reports",
    title: "Atendimentos",
    icon: "chartPie",
    roles: STAFF_ROLES,
    children: [
      {
        slug: "services-reports-patients",
        title: "Pacientes",
        url: "/relatorios/atendimentos/pacientes",
        roles: STAFF_ROLES,
      },
      {
        slug: "services-reports-profissionals",
        title: "Profissionais",
        url: "/relatorios/atendimentos/profissionais",
        roles: STAFF_ROLES,
      },
      {
        slug: "services-reports-cities",
        title: "Cidades",
        url: "/relatorios/atendimentos/cidades",
        roles: STAFF_ROLES,
      },
    ],
  },
    {
    slug: "finance-reports",
    title: "Financeiro",
    icon: "chartNoAxesCombined",
    roles: STAFF_ROLES,
    children: [
      {
        slug: "finance-reports-revenue-expense",
        title: "Receitas X Despesas",
        url: "/relatorios/financeiro/receitas-despesas",
        roles: STAFF_ROLES,
      },
      {
        slug: "finance-reports-dre",
        title: "Demonstrativo (DRE)",
        url: "/relatorios/financeiro/dre",
        roles: STAFF_ROLES,
      },
    ]
  },
  {
    slug: "section-settings",
    title: "Configuração Geral",
    isSection: true,
  },
  {
    slug: "team-management",
    title: "Equipe",
    icon: "users",
    roles: ADMIN_ONLY,
    children: [
      {
        slug: "users",
        title: "Usuários",
        url: "/usuarios",
        roles: ADMIN_ONLY,
      },
      {
        slug: "collaborators",
        title: "Colaboradores",
        url: "/colaboradores",
        disabled: true,
        roles: ADMIN_ONLY,
      },
    ]
  },
  {
    slug: "configurations",
    title: "Configurações",
    url: "/configuracoes",
    icon: "settings",
    roles: ADMIN_ONLY,
  },
]
