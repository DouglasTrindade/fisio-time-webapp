import { AppSidebar } from "./App/Sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "./components/Breadcrumb";
import { BackButton } from "./components/BackButton";
import { NotificationsBell } from "./notificacoes/_components/Bell";
import { ModalProvider } from "@/contexts/modal-provider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ModalProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center w-full gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumbs />
              <BackButton />
              <div className="ml-auto flex items-center gap-2">
                <NotificationsBell />
              </div>
            </div>
          </header>
          <main className="p-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ModalProvider>
  );
}
