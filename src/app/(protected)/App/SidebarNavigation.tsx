"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  BriefcaseMedical,
  Calendar,
  ChartPie,
  ChevronDown,
  CircleArrowUp,
  LayoutDashboard,
  MonitorCheckIcon,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react"

import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { SidebarMenuItemConfig, SidebarIconName } from "./sidebar.config"

interface SidebarNavigationProps {
  items: SidebarMenuItemConfig[]
}

export function SidebarNavigation({ items }: SidebarNavigationProps) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  useEffect(() => {
    setOpenGroups((prev) => {
      const nextState = { ...prev }
      items.forEach((item) => {
        if (!item.children?.length) {
          return
        }
        const shouldOpen = item.children.some((child) =>
          pathname?.startsWith(child.url),
        )
        const previousValue = prev[item.slug] ?? false
        if (shouldOpen !== previousValue) {
          nextState[item.slug] = shouldOpen
        }
      })
      return nextState
    })
  }, [items, pathname])
  const iconMap: Record<SidebarIconName, LucideIcon> = {
    layoutDashboard: LayoutDashboard,
    calendar: Calendar,
    users: Users,
    monitorCheck: MonitorCheckIcon,
    briefcaseMedical: BriefcaseMedical,
    circleArrowUp: CircleArrowUp,
    chartPie: ChartPie,
    settings: Settings,
  }

  return (
    <SidebarMenu>
      {items.map((item) => {
        if (item.isSection) {
          return (
            <SidebarGroupLabel
              key={item.slug}
              className="px-2 pt-4 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {item.title}
            </SidebarGroupLabel>
          )
        }

        const isDisabled = Boolean(item.disabled)

        if (item.children?.length) {
          const isGroupActive = item.children.some((child) =>
            pathname?.startsWith(child.url),
          )
          const isOpen = isDisabled ? false : openGroups[item.slug] ?? false

          return (
            <Collapsible
              key={item.slug}
              open={isOpen}
              disabled={isDisabled}
              onOpenChange={(nextOpen) => {
                if (isDisabled) return
                setOpenGroups((prev) => ({ ...prev, [item.slug]: nextOpen }))
              }}
            >
              <SidebarMenuItem className="flex flex-col gap-1">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    type="button"
                    isActive={isGroupActive}
                    className={cn(
                      "justify-between",
                      isDisabled && "cursor-not-allowed opacity-60",
                    )}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                    title={isDisabled ? "Em breve" : undefined}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon ? (
                        <IconFromMap icon={item.icon} iconMap={iconMap} />
                      ) : null}
                      <span>{item.title}</span>
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent
                  className="overflow-hidden data-[state=closed]:pointer-events-none data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"
                >
                  <SidebarMenuSub>
                    {item.children.map((child) => {
                      const isActive = pathname === child.url
                      const isChildDisabled = Boolean(child.disabled)
                      return (
                        <SidebarMenuSubItem key={child.slug}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={!isChildDisabled && isActive}
                            aria-disabled={isChildDisabled}
                            className={cn(
                              isChildDisabled && "cursor-not-allowed opacity-60",
                            )}
                            title={isChildDisabled ? "Em breve" : undefined}
                          >
                            {isChildDisabled ? (
                              <span className="flex items-center gap-2">
                                {child.title}
                              </span>
                            ) : (
                              <a href={child.url}>{child.title}</a>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        }

        return (
          <SidebarMenuItem key={item.slug}>
            <SidebarMenuButton
              asChild={Boolean(item.url) && !isDisabled}
              isActive={!isDisabled && pathname === item.url}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              className={cn(isDisabled && "cursor-not-allowed opacity-60")}
              title={isDisabled ? "Em breve" : undefined}
            >
              {item.url && !isDisabled ? (
                <a href={item.url}>
                  {item.icon ? <IconFromMap icon={item.icon} iconMap={iconMap} /> : null}
                  <span>{item.title}</span>
                </a>
              ) : (
                <>
                  {item.icon ? <IconFromMap icon={item.icon} iconMap={iconMap} /> : null}
                  <span className={cn(isDisabled && "text-muted-foreground")}>
                    {item.title}
                  </span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function IconFromMap({
  icon,
  iconMap,
}: {
  icon: SidebarIconName
  iconMap: Record<SidebarIconName, LucideIcon>
}) {
  const Component = iconMap[icon]
  if (!Component) return null
  return <Component className="h-4 w-4 shrink-0" />
}
