"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { UserProfile } from "@/types/user";
import { useDeleteRecord } from "@/hooks/useRecord";

interface DeleteUserDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function DeleteUserDialog({ user, open, onOpenChange, disabled, onSuccess }: DeleteUserDialogProps) {
  const deleteUser = useDeleteRecord("/users");

  const handleDelete = async () => {
    if (!user) return;
    await deleteUser.mutateAsync(user.id);
    onOpenChange(false);
    onSuccess?.();
  };

  const isSubmitting = deleteUser.isPending;
  const preventClose = disabled || isSubmitting;

  return (
    <AlertDialog open={open} onOpenChange={(value) => (!preventClose ? onOpenChange(value) : undefined)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover{" "}
            <strong className="font-semibold text-foreground">{user?.name ?? "este usuário"}</strong>? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={disabled || isSubmitting || !user}
            >
              {isSubmitting ? "Excluindo..." : "Excluir"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
