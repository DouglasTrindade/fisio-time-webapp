"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type {
  AppNotification,
  NotificationStatus,
  NotificationCategory,
} from "@/types/notification"
import { NotificationCard } from "./Card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCheck, Filter, LayoutList, Search, SendHorizontal } from "lucide-react"
import { NotificationDialog } from "./Modal"
import { SendNotificationDialog } from "./SendNotificationModal"
import { useRecords } from "@/hooks/useRecords"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"
import { toast } from "sonner"

const statusOptions: Array<{ value: NotificationStatus | "all"; label: string }> = [
  { value: "all", label: "Status" },
  { value: "unread", label: "Não lidas" },
  { value: "read", label: "Lidas" },
]

const typeOptions: Array<{ value: NotificationCategory | "all"; label: string }> = [
  { value: "all", label: "Tipo" },
  { value: "system", label: "Sistema" },
  { value: "finance", label: "Financeiro" },
  { value: "attendance", label: "Atendimentos" },
  { value: "message", label: "Mensagens" },
]

export const NotificationsPage = () => {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<NotificationStatus | "all">("all")
  const [category, setCategory] = useState<NotificationCategory | "all">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [selected, setSelected] = useState<AppNotification | null>(null)
  const [showAllSent, setShowAllSent] = useState(false)
  const [notificationsState, setNotificationsState] = useState<AppNotification[]>([])

  const inboxQuery = useMemo(
    () => ({
      page: 1,
      limit: 100,
      scope: "received" as const,
    }),
    [],
  )

  const {
    records: inboxNotifications,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
  } = useRecords<AppNotification>("/notifications", inboxQuery)

  const sentQuery = useMemo(
    () => ({
      page: 1,
      limit: showAllSent ? 20 : 4,
      scope: "sent" as const,
    }),
    [showAllSent],
  )

  const {
    records: sentNotifications,
    isLoading: isLoadingSent,
    refetch: refetchSentNotifications,
  } = useRecords<AppNotification>("/notifications", sentQuery)

  const stableInboxNotifications = isLoadingNotifications ? null : inboxNotifications

  useEffect(() => {
    if (!stableInboxNotifications) return
    setNotificationsState(stableInboxNotifications)
  }, [stableInboxNotifications])

  const filteredNotifications = useMemo(() => {
    return notificationsState.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(search.toLowerCase()) ||
        notification.message.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = status === "all" ? true : notification.status === status
      const matchesCategory =
        category === "all" ? true : notification.category === category

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [notificationsState, search, status, category])

  const markNotificationAsRead = useCallback(
    async (notification: AppNotification | null) => {
      if (!notification || notification.status !== "unread") {
        return
      }

      setNotificationsState((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, status: "read" } : item,
        ),
      )

      try {
        await apiRequest<ApiResponse<AppNotification>>(`/notifications/${notification.id}`, {
          method: "PATCH",
        })
        await refetchNotifications()
      } catch (error) {
        console.error(error)
        toast.error("Não foi possível marcar a notificação como lida")
        setNotificationsState((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, status: "unread" } : item,
          ),
        )
      }
    },
    [refetchNotifications],
  )

  const handleOpenDetails = (notification: AppNotification) => {
    setSelected(notification)
    setDialogOpen(true)
    void markNotificationAsRead(notification)
  }

  const handleNotificationSent = async () => {
    await Promise.all([refetchNotifications(), refetchSentNotifications()])
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe novidades, tickets e mensagens importantes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Marcar todas como lidas
          </Button>
          <Button variant="secondary" size="icon">
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar notificações..."
            className="pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={(value) => setStatus(value as NotificationStatus | "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={category}
            onValueChange={(value) => setCategory(value as NotificationCategory | "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="shrink-0 gap-2" onClick={() => setSendDialogOpen(true)}>
            <SendHorizontal className="h-4 w-4" />
            Enviar notificação
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-border/60 bg-card/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold">Notificações enviadas</p>
            <p className="text-sm text-muted-foreground">
              Histórico recente de mensagens entre profissionais.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowAllSent((prev) => !prev)}>
            {showAllSent ? "Mostrar menos" : "Ver todas"}
          </Button>
        </div>

        {isLoadingSent ? (
          <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
            Carregando notificações enviadas...
          </div>
        ) : sentNotifications.length ? (
          <div className="space-y-2">
            {sentNotifications.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background/60 p-3 text-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{item.recipient?.name ?? "Usuário"}</p>
                  <p className="text-muted-foreground">{item.message}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {item.sendMode === "now"
                      ? "Enviada agora"
                      : `Programada para ${item.scheduledFor
                        ? formatDistanceToNow(new Date(item.scheduledFor), {
                          locale: ptBR,
                          addSuffix: true,
                        })
                        : "data indefinida"
                      }`}
                  </span>
                  <span>•</span>
                  <span>{item.includeEmail ? "App + e-mail" : "Somente app"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
            Nenhuma notificação enviada ainda.
          </div>
        )}
      </div>

      <div className="space-y-3">
        {isLoadingNotifications ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
            Carregando notificações...
          </div>
        ) : (
          <>
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="w-full text-left"
                role="button"
                tabIndex={0}
                onClick={() => handleOpenDetails(notification)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handleOpenDetails(notification)
                  }
                }}
              >
                <NotificationCard.Root
                  unread={notification.status === "unread"}
                  highlight={notification.highlight}
                >
                  <NotificationCard.Status unread={notification.status === "unread"} />
                  <NotificationCard.Media notification={notification} />
                  <NotificationCard.Content>
                    <div className="flex flex-wrap items-start gap-2">
                      <NotificationCard.Title>{notification.title}</NotificationCard.Title>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {notification.channel}
                      </span>
                    </div>
                    <NotificationCard.Description>{notification.message}</NotificationCard.Description>
                    <NotificationCard.Meta>
                      <span>
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      {notification.priority === "high" ? (
                        <>
                          <span>•</span>
                          <span className="text-amber-500">Prioridade alta</span>
                        </>
                      ) : null}
                    </NotificationCard.Meta>
                    {notification.actions?.length ? (
                      <NotificationCard.Actions>
                        {notification.actions.map((action) => (
                          <Button key={action.id} size="sm" variant={action.variant ?? "outline"}>
                            {action.label}
                          </Button>
                        ))}
                      </NotificationCard.Actions>
                    ) : null}
                  </NotificationCard.Content>
                </NotificationCard.Root>
              </div>
            ))}

            {filteredNotifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                Nenhuma notificação encontrada para o filtro atual.
              </div>
            ) : null}
          </>
        )}
      </div>

      <NotificationDialog
        notification={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <SendNotificationDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        onSend={handleNotificationSent}
      />
    </section>
  )
}
