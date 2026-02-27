"use client"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { UserProfile } from "@/types/user"
import { useDeleteRecord } from "@/hooks/useRecord"

interface DeleteUserDialogProps {
  user: UserProfile | null
  disabled?: boolean
  onHide?: () => void
  onSuccess?: () => void
}

export function DeleteUserDialog({ user, disabled, onHide, onSuccess }: DeleteUserDialogProps) {
  const deleteUser = useDeleteRecord("/users")

  const handleDelete = async () => {
    if (!user) return
    await deleteUser.mutateAsync(user.id)
    onHide?.()
    onSuccess?.()
  }

  const isSubmitting = deleteUser.isPending
  const preventClose = disabled || isSubmitting

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Excluir usuário</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja remover{" "}
          <strong className="font-semibold text-foreground">{user?.name ?? "este usuário"}</strong>? Essa ação não pode ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => (!preventClose ? onHide?.() : undefined)}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={disabled || isSubmitting || !user}
        >
          {isSubmitting ? "Excluindo..." : "Excluir"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
