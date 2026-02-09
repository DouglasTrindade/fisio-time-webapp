"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { UserProfile } from "@/types/user";
import { UserFormModal } from "./UserFormModal";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface UserDetailActionsProps {
  user: UserProfile;
  disableDelete?: boolean;
}

export function UserDetailActions({ user, disableDelete }: UserDetailActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button variant="outline" onClick={() => setIsEditOpen(true)}>
          Editar
        </Button>
        <Button
          variant="destructive"
          onClick={() => setIsDeleteOpen(true)}
          disabled={disableDelete}
        >
          Excluir
        </Button>
      </div>

      <UserFormModal
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={user}
        onSuccess={() => router.refresh()}
      />

      <DeleteUserDialog
        user={user}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        disabled={disableDelete}
        onSuccess={() => router.push("/usuarios")}
      />
    </>
  );
}
