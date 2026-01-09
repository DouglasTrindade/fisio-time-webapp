
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center">
        <Image src="/logo.png" width={100} height={100} alt="logo" />
      </SidebarHeader>
      <SidebarContent>
        <Separator border="solid" borderSize="0" className="my-2" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarNavigation items={menuItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ?? {}} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
