"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { roleLabels } from "./InviteManagement/utils";
import type { AppRole, UserProfile } from "@/types/user";
import type { ApiResponse } from "@/types/api";
import { useCreateRecord } from "@/hooks/useRecords";
import { useUpdateRecord } from "@/hooks/useRecord";

const baseSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().email("Informe um e-mail válido"),
  role: z.nativeEnum(Role, { required_error: "Selecione a função" }),
});

const createSchema = baseSchema.extend({
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres"),
});

const editSchema = baseSchema.extend({
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres").optional(),
});

type UserFormValues = z.infer<typeof editSchema>;

interface UserFormModalProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserProfile | null;
  onSuccess?: () => void;
}

export function UserFormModal({ mode, open, onOpenChange, user, onSuccess }: UserFormModalProps) {
  const resolverSchema = useMemo(() => (mode === "create" ? createSchema : editSchema), [mode]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(resolverSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: (user?.role as AppRole) ?? "PROFESSIONAL",
      password: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        role: (user?.role as AppRole) ?? "PROFESSIONAL",
        password: "",
      });
    }
  }, [open, user, form]);

  if (mode === "edit" && !user) {
    return null;
  }

  const createUser = useCreateRecord<ApiResponse<UserProfile>, UserFormValues>("/users");
  const updateUser = useUpdateRecord<ApiResponse<UserProfile>, UserFormValues>("/users");

  const isSubmitting = createUser.isPending || updateUser.isPending;

  const handleClose = (nextState: boolean) => {
    if (!nextState) {
      form.reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        role: (user?.role as AppRole) ?? "PROFESSIONAL",
        password: "",
      });
    }
    onOpenChange(nextState);
  };

  const onSubmit = async (values: UserFormValues) => {
    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
      password: values.password?.trim() ? values.password : undefined,
    };

    if (mode === "create") {
      if (!payload.password) {
        return;
      }
      await createUser.mutateAsync(payload);
    } else if (user) {
      await updateUser.mutateAsync({
        id: user.id,
        data: payload,
      });
    }

    form.reset({
      name: "",
      email: "",
      role: "PROFESSIONAL",
      password: "",
    });
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo usuário" : "Editar usuário"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Cadastre um usuário com acesso imediato." : "Atualize os dados cadastrais do usuário selecionado."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do usuário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="nome@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(roleLabels) as AppRole[]).map((role) => (
                        <SelectItem key={role} value={role}>
                          {roleLabels[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{mode === "create" ? "Senha inicial" : "Atualizar senha"}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={mode === "create" ? "Crie uma senha temporária" : "Informe para redefinir"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : mode === "create" ? "Criar usuário" : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
