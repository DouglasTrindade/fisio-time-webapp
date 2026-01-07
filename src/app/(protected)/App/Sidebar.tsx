
import { Calendar, Settings, Users, LayoutDashboard, MonitorCheckIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NavUser } from "./NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const menuItems = [
  {
    title: "Navegação Principal",
    isSection: true,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agendamentos",
    url: "/agendamentos",
    icon: Calendar,
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: Users,
  },
  {
    title: "Atendimentos",
    url: "/atendimentos",
    icon: MonitorCheckIcon,
  },
  {
    title: "Configuração Geral",
    isSection: true,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
];

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
            <SidebarMenu>
              {menuItems.map((item) =>
                item.isSection ? (
                  <SidebarGroupLabel
                    key={item.title}
                    className="px-2 pt-4 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {item.title}
                  </SidebarGroupLabel>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        {item.icon ? <item.icon /> : null}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
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
