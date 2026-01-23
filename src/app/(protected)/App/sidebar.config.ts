export type SidebarMenuItemConfig = {
  slug: string
  title: string
  url?: string
  icon?: SidebarIconName
  isSection?: boolean
  disabled?: boolean
  children?: Array<{
    slug: string
    title: string
    url: string
    disabled?: boolean
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
  },
  {
    slug: "appointments",
    title: "Agendamentos",
    url: "/agendamentos",
    icon: "calendar",
  },
  {
    slug: "patients",
    title: "Pacientes",
    url: "/pacientes",
    icon: "users",
  },
  {
    slug: "services",
    title: "Atendimentos",
    url: "/atendimentos",
    icon: "monitorCheck",
  },
  {
    slug: "treatments",
    title: "Tratamentos",
    url: "/tratamentos",
    icon: "briefcaseMedical",
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
  },
  {
    slug: "invoices",
    title: "Notas Fiscais (NFS-e)",
    url: "/notas-fiscais",
    icon: "circleArrowUp",
    disabled: true
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
    children: [
      {
        slug: "services-reports-patients",
        title: "Pacientes",
        url: "/relatorios/atendimentos/pacientes",
      },
      {
        slug: "services-reports-profissionals",
        title: "Profissionais",
        url: "/relatorios/atendimentos/profissionais",
      },
      {
        slug: "services-reports-cities",
        title: "Cidades",
        url: "/relatorios/atendimentos/cidades",
      },
    ],
  },
    {
    slug: "finance-reports",
    title: "Financeiro",
    icon: "chartNoAxesCombined",
    children: [
      {
        slug: "finance-reports-revenue-expense",
        title: "Receitas X Despesas",
        url: "/relatorios/financeiro/receitas-despesas",
      },
      {
        slug: "finance-reports-dre",
        title: "Demonstrativo (DRE)",
        url: "/relatorios/financeiro/dre",
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
    children: [
      {
        slug: "users",
        title: "Usuários",
        url: "/usuarios",
      },
      {
        slug: "collaborators",
        title: "Colaboradores",
        url: "/colaboradores",
        disabled: true
      },
    ]
  },
  {
    slug: "configurations",
    title: "Configurações",
    url: "/configuracoes",
    icon: "settings",
  },
]
