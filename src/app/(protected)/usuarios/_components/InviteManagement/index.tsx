"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Copy, Trash2, Users2 } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { useRecords, useCreateRecord } from "@/hooks/useRecords"
import { useDeleteRecord } from "@/hooks/useRecord"
import type { ApiResponse } from "@/types/api"
import type { UserInviteSummary } from "@/types/user"

import { InviteFields } from "./Fields"
import { inviteFormSchema, type InviteFormValues } from "./Fields/schema"
import { roleLabels } from "./utils"

export const InviteManagement = () => {
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "PROFESSIONAL",
    },
  })

  const { records: invites, isLoading: isLoadingInvites } = useRecords<UserInviteSummary>(
    "/users/invites",
    { page: 1, limit: 50 },
  )

  const createInvite = useCreateRecord<ApiResponse<UserInviteSummary>, InviteFormValues>(
    "/users/invites",
  )
  const revokeInvite = useDeleteRecord("/users/invites")

  const [origin, setOrigin] = useState("")
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const handleInviteSubmit = form.handleSubmit((values) => {
    createInvite.mutate(values, {
      onSuccess: () => {
        form.reset({ email: "", role: "PROFESSIONAL" })
      },
    })
  })

  const copyInviteLink = async (token: string) => {
    const link = origin ? `${origin}/sign-up?invite=${token}` : token
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Link copiado para a área de transferência")
    } catch {
      toast.error("Não foi possível copiar o link")
    }
  }

  const inviteList = useMemo(() => invites, [invites])

  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <CardTitle>Convites</CardTitle>
        <CardDescription>Convide novos membros e defina o nível de acesso.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <Form {...form}>
            <form className="space-y-4" onSubmit={handleInviteSubmit}>
              <InviteFields />
              <Button type="submit" className="w-full" disabled={createInvite.isPending}>
                {createInvite.isPending ? "Enviando..." : "Enviar convite"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Convites pendentes</p>
              <p className="text-xs text-muted-foreground">Expiram em 7 dias</p>
            </div>
            <Users2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-4 space-y-3">
            {isLoadingInvites ? (
              <Skeleton className="h-20 w-full" />
            ) : inviteList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum convite pendente.</p>
            ) : (
              inviteList.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/60 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">{roleLabels[invite.role]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => copyInviteLink(invite.token)}>
                        <Copy className="mr-1 h-4 w-4" />
                        Copiar link
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Cancelar convite"
                        disabled={revokeInvite.isPending}
                        onClick={() => revokeInvite.mutate(invite.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>
                      Enviado por {invite.createdBy?.name ?? "você"} em {" "}
                      {format(new Date(invite.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                    <p>
                      Expira {" "}
                      {formatDistanceToNow(new Date(invite.expiresAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
