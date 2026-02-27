"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRecords } from "@/hooks/useRecords"
import type { AppRole, UserProfile } from "@/types/user"

import { InviteManagement } from "./InviteManagement"
import { roleLabels } from "./InviteManagement/utils"
import { ListItem } from "./ListItem"
import { UserFormModal } from "./UserFormModal"
import { DeleteUserDialog } from "./DeleteUserDialog"
import { useModalContext } from "@/contexts/ModalContext"

interface UserProps {
  currentRole?: AppRole
  currentUserId?: string
}

export const Users = ({ currentRole, currentUserId }: UserProps) => {
  const { records: members, isLoading: isLoadingMembers } = useRecords<UserProfile>(
    "/users",
    { page: 1, limit: 50, sortBy: "name", sortOrder: "asc" },
  )
  const { openModal } = useModalContext<UserProfile, { user: UserProfile; disabled?: boolean }>()
  const { openModal: openUserModal } = useModalContext<UserProfile, { mode: "create" | "edit"; user?: UserProfile | null }>()

  const handleDeleteModal = (user: UserProfile, disabled?: boolean) => {
    openModal(
      {
        modal: DeleteUserDialog,
      },
      { user, disabled }
    )
  }

  const handleCreateUser = () => {
    openUserModal(
      {
        modal: UserFormModal,
      },
      { mode: "create" }
    )
  }

  const handleEditUser = (user: UserProfile) => {
    openUserModal(
      {
        modal: UserFormModal,
      },
      { mode: "edit", user }
    )
  }


  const canManageUsers = currentRole === "ADMIN" || currentRole === "PROFESSIONAL"
  const canCreateUser = currentRole === "ADMIN"
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
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Membros ativos</CardTitle>
            <CardDescription>Visão geral de quem possui acesso à conta.</CardDescription>
          </div>
          {canCreateUser ? (
            <Button onClick={handleCreateUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              Criar usuário
            </Button>
          ) : null}
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
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
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
                      onEdit={() => handleEditUser(member)}
                      onDelete={() => handleDeleteModal(member, member.id === currentUserId)}
                      disableDelete={member.id === currentUserId}
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
