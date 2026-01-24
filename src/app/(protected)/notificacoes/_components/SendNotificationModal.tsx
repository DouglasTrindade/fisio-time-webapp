"use client"

import { useMemo, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Mail } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import type { UserProfile } from "@/types/user"
import { useRecords } from "@/hooks/useRecords"
import { cn } from "@/lib/utils"
import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { AppNotification } from "@/types/notification"
import { toast } from "sonner"

const sendNotificationSchema = z
  .object({
    recipientId: z.string().min(1, "Selecione um profissional"),
    message: z.string().min(5, "Mensagem muito curta"),
    sendMode: z.enum(["now", "scheduled"]).default("now"),
    scheduledFor: z.string().optional(),
    includeEmail: z.boolean().default(false),
  })
  .superRefine((values, ctx) => {
    if (values.sendMode === "scheduled" && !values.scheduledFor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a data da notificação programada",
        path: ["scheduledFor"],
      })
    }
  })

export type SendNotificationValues = z.infer<typeof sendNotificationSchema>

interface SendNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend?: () => Promise<void> | void
}

export const SendNotificationDialog = ({
  open,
  onOpenChange,
  onSend,
}: SendNotificationDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectOpen, setSelectOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const usersQuery = useMemo(
    () => ({
      page: 1,
      limit: 50,
    }),
    [],
  )
  const { records: users, isLoading } = useRecords<UserProfile>("/users", usersQuery)

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    return users.filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [users, searchTerm])

  const form = useForm<SendNotificationValues>({
    resolver: zodResolver(sendNotificationSchema) as any,
    defaultValues: {
      recipientId: "",
      message: "",
      sendMode: "now",
      scheduledFor: "",
      includeEmail: false,
    },
  })

  const selectedUser = users.find((user) => user.id === form.watch("recipientId"))

  const onSubmit: SubmitHandler<SendNotificationValues> = async (values) => {
    const recipient = users.find((user) => user.id === values.recipientId)
    if (!recipient) return

    try {
      setIsSubmitting(true)
      await apiRequest<ApiResponse<AppNotification>>("/notifications", {
        method: "POST",
        data: {
          recipientId: values.recipientId,
          message: values.message,
          sendMode: values.sendMode,
          scheduledFor: values.scheduledFor,
          includeEmail: values.includeEmail,
        },
      })

      toast.success(
        values.sendMode === "now"
          ? "Notificação enviada com sucesso"
          : "Notificação programada com sucesso",
      )

      await onSend?.()
      form.reset()
      setSearchTerm("")
      onOpenChange(false)
    } catch (error) {
      console.error("Falha ao enviar notificação", error)
      toast.error("Não foi possível enviar a notificação")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    setSearchTerm("")
    setSelectOpen(false)
  }

  const isScheduled = form.watch("sendMode") === "scheduled"

  const RequiredMark = () => <span className="ml-1 text-destructive">*</span>

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (!isOpen ? handleClose() : onOpenChange(isOpen))}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Enviar notificação</DialogTitle>
          <DialogDescription>
            Envie uma mensagem para outro profissional da equipe.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Profissional <RequiredMark />
                  </FormLabel>
                  <Popover open={selectOpen} onOpenChange={setSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <span>
                          {selectedUser
                            ? `${selectedUser.name ?? "Usuário"} (${selectedUser.email ?? "sem e-mail"})`
                            : "Selecione um profissional"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 space-y-2">
                      <Input
                        placeholder="Buscar profissional..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        autoFocus
                      />
                      <div className="max-h-52 overflow-y-auto rounded-md border">
                        {isLoading ? (
                          <div className="p-4 text-sm text-muted-foreground">
                            Carregando profissionais...
                          </div>
                        ) : filteredUsers.length ? (
                          filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              className={cn(
                                "flex w-full flex-col gap-px px-3 py-2 text-left text-sm",
                                field.value === user.id
                                  ? "bg-muted font-medium"
                                  : "hover:bg-muted/60",
                              )}
                              onClick={() => {
                                field.onChange(user.id)
                                setSelectOpen(false)
                              }}
                            >
                              <span>{user.name ?? "Usuário sem nome"}</span>
                              <span className="text-xs text-muted-foreground">
                                {user.email ?? "Sem e-mail"}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-muted-foreground">
                            Nenhum profissional encontrado.
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mensagem <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Digite sua mensagem" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sendMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agendamento</FormLabel>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-3 md:grid-cols-2"
                  >
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                      <RadioGroupItem value="now" />
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">Enviar agora</p>
                        <p className="text-muted-foreground">Notifica imediatamente.</p>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                      <RadioGroupItem value="scheduled" />
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">Notificação programada</p>
                        <p className="text-muted-foreground">Escolha data e hora.</p>
                      </div>
                    </label>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isScheduled ? (
              <FormField
                control={form.control}
                name="scheduledFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Data e hora <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="includeEmail"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">Enviar por e-mail</p>
                      <p className="text-muted-foreground">Também notificar via e-mail.</p>
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Processando..."
                  : form.watch("sendMode") === "now"
                    ? "Enviar agora"
                    : "Agendar envio"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
