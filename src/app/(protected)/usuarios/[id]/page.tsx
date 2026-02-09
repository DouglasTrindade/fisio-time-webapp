import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/auth/permissions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { roleLabels } from "../_components/InviteManagement/utils";
import type { AppRole } from "@/types/user";
import { UserDetailActions } from "../_components/UserDetailActions";

interface UserDetailsPageProps {
  params: { id?: string | string[] };
  searchParams?: { id?: string | string[]; userId?: string | string[] };
}

const normalizeId = (raw?: string | string[]) => {
  if (!raw) return undefined;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() ? value : undefined;
};

export default async function UserDetailsPage({ params, searchParams }: UserDetailsPageProps) {
  const session = await auth();

  if (!session?.user || !canManageUsers(session.user.role)) {
    redirect("/usuarios");
  }

  const userId = normalizeId(params?.id) ?? normalizeId(searchParams?.id) ?? normalizeId(searchParams?.userId);
  if (!userId) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const createdAt = format(user.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const updatedAt = format(user.updatedAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Detalhes do usuário</h1>
          <p className="text-muted-foreground">Consulte informações e gerencie o acesso deste membro.</p>
        </div>

        <Button asChild variant="outline">
          <Link href="/usuarios">Voltar para listagem</Link>
        </Button>
      </div>

      <Card className="border-border/70 bg-card/85 shadow-lg">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Usuário"} />
              <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name ?? "Usuário sem nome"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>

          <Badge className="w-fit px-4 py-1 text-sm">
            {roleLabels[user.role as AppRole] ?? user.role}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data de entrada</p>
            <p className="font-medium">{createdAt}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Última atualização</p>
            <p className="font-medium">{updatedAt}</p>
          </div>
        </CardContent>
      </Card>

      <UserDetailActions user={user} disableDelete={session.user.id === user.id} />
    </section>
  );
}
