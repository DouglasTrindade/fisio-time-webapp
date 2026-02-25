import type { Icon } from 'lucide-react'

import { User } from '@prisma/client'

import { Icons } from '@/components/icons'

// Re-export all types from packages with better organization
export * from '../packages/core'
export * from '../packages/auth'
export * from '../packages/shell'
export * from '../packages/ui'

// Form types and components with JSDoc documentation
/**
 * Form components from @tootz/react-admin/form
 *
 * @example
 * ```tsx
 * import { ImageInput, FormItem, Input } from '@tootz/react-admin/form'
 *
 * <FormItem name="image_id">
 *   <ImageInput className="w-32 h-32" />
 * </FormItem>
 * ```
 */
export * from '../packages/form'

export type RecordType = Record<string, unknown>

export type CustomAction =
  | string
  | {
      method: string
      name: string
    }

export interface DeleteOptions {
  path?: string
  confirm?: boolean
  confirmTitle?: string
  confirmText?: string
  callback?: (success: boolean, data?: any) => void
}

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: NavLink[]
    }
)

export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

export type DocsConfig = {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export type MarketingConfig = {
  mainNav: MainNavItem[]
}

export type DashboardConfig = {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export type SubscriptionPlan = {
  name: string
  description: string
  stripePriceId: string
}

export type UserSubscriptionPlan = SubscriptionPlan &
  Pick<User, 'stripeCustomerId' | 'stripeSubscriptionId'> & {
    stripeCurrentPeriodEnd: number
    isPro: boolean
  }

export type ConfigSort = {
  field: string
  order: 'asc' | 'desc'
}

/**
 * Configuration object for resources
 *
 * @example
 * ```tsx
 * const config: Config = {
 *   apiBasePath: '/admin/users',
 *   basePath: '/users',
 *   humanName: { singular: 'Usuário', plural: 'Usuários' }
 * }
 * ```
 */
export interface HumanName {
  singular: string
  plural: string
}

export type Config = {
  apiBasePath: string
  basePath?: string
  edit?: boolean
  options?: any
  forceIdPresence?: boolean
  shouldFetch?: boolean
  params?: Record<string, unknown>
  customAction?: string
  pagination?: {
    perPage?: number
  }
  sort?: ConfigSort | ConfigSort[]
  filter?: Record<string, unknown>
  humanName?: HumanName
  icon?: string | React.ComponentType
}

export interface ConfigOption {
  name: string
  slug: string
  variant?: string
}

export type QuerySortType = {
  field: string
  order: string
}

export interface QueryType {
  pagination?: {
    page?: number
    per_page?: number
    perPage?: number
  }
  sort?: QuerySortType | Array<QuerySortType>
  filter?: object
  params?: object
  [key: string]: unknown
}

export type PaginationParams = {
  page: number
  perPage: number
}

export type SortParams = {
  field: string
  order: 'asc' | 'desc'
}

export type FilterParams = Record<string, unknown>

export type ParamsKey = 'pagination' | 'sort' | 'filter'

export type Params = {
  pagination: PaginationParams
  sort: SortParams
  filter: FilterParams
}

/**
 * Human-readable names for resources
 *
 * @example
 * ```tsx
 * const humanName: HumanName = {
 *   singular: 'Documento',
 *   plural: 'Documentos'
 * }
 * ```
 */
export interface HumanName {
  singular: string
  plural: string
}
