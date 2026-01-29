"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRecords } from "@/hooks/useRecords"
import type { AppRole, UserProfile } from "@/types/user"

import { InviteManagement } from "./InviteManagement"
import { roleLabels } from "./InviteManagement/utils"
import { ListItem } from "./ListItem"

interface UserProps {
  currentRole?: AppRole
}

export const Users = ({ currentRole }: UserProps) => {
  const { records: members, isLoading: isLoadingMembers } = useRecords<UserProfile>(
    "/users",
    { page: 1, limit: 50, sortBy: "name", sortOrder: "asc" },
  )

  const canManageUsers = currentRole === "ADMIN" || currentRole === "PROFESSIONAL"
  const sortedMembers = useMemo(() => members, [members])

  if (!canManageUsers) {
    return (
      <Card className="border-border/70 bg-card/85 shadow-lg">
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Somente administradores ou profissionais responsáveis podem gerenciar convites.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <InviteManagement />

      <Card className="border-border/70 bg-card/85 shadow-lg">
        <CardHeader>
          <CardTitle>Membros ativos</CardTitle>
          <CardDescription>Visão geral de quem possui acesso à conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Entrada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                      Nenhum membro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedMembers.map((member) => (
                    <ListItem
                      key={member.id}
                      member={member}
                      roleLabel={roleLabels[member.role as AppRole]}
                      formattedDate={
                        member.createdAt
                          ? format(new Date(member.createdAt), "dd/MM/yyyy", { locale: ptBR })
                          : "—"
                      }
                    />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
