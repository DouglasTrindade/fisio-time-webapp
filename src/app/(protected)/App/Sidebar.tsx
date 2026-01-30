
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NavUser } from "./NavUser";
import { SidebarNavigation } from "./SidebarNavigation";
import { menuItems } from "./sidebar.config";
import type { SidebarMenuItemConfig } from "./sidebar.config";
import type { AppRole } from "@/types/user";
import { UpgradeCard } from "@/components/ui/upgrade-card";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true },
    })
    : null;

  const role = session?.user?.role as AppRole | undefined
  const filteredMenuItems = filterMenuItemsByRole(menuItems, role)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center">
        <Image src="/logo.png" width={100} height={100} alt="logo" />
      </SidebarHeader>
      <SidebarContent>
        <Separator border="solid" borderSize="0" className="my-2" />
        <SidebarGroup>
          <SidebarGroupContent className="h-full">
            <SidebarNavigation items={filteredMenuItems} />
          </SidebarGroupContent>
        </SidebarGroup>
        <UpgradeCard />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ?? {}} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

const hasAccess = (allowedRoles: AppRole[] | undefined, role: AppRole | undefined) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true
  }
  return role ? allowedRoles.includes(role) : false
}

const filterMenuItemsByRole = (
  items: typeof menuItems,
  role: AppRole | undefined,
) => {
  const accessibleItems = items
    .map((item) => {
      if (item.isSection) {
        return item
      }

      if (!hasAccess(item.roles, role)) {
        return null
      }

      if (item.children?.length) {
        const filteredChildren = item.children.filter((child) =>
          hasAccess(child.roles, role),
        )

        if (filteredChildren.length === 0) {
          return null
        }

        return { ...item, children: filteredChildren }
      }

      return item
    })
    .filter(Boolean) as typeof menuItems

  const cleanedItems: typeof menuItems = []
  let pendingSection: SidebarMenuItemConfig | null = null

  accessibleItems.forEach((item) => {
    if (item.isSection) {
      pendingSection = item
      return
    }

    if (pendingSection) {
      cleanedItems.push(pendingSection)
      pendingSection = null
    }

    cleanedItems.push(item)
  })

  return cleanedItems
}
