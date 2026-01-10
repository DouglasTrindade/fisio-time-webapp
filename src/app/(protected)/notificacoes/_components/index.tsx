"use client"

import { useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { AppNotification, NotificationStatus, NotificationCategory } from "@/app/types/notification"
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
import { CheckCheck, Filter, LayoutList, Search } from "lucide-react"
import { NotificationDialog } from "./Modal"

interface NotificationsPageProps {
  notifications: AppNotification[]
}

const statusOptions: Array<{ value: NotificationStatus | "all"; label: string }> = [
  { value: "all", label: "Status" },
  { value: "unread", label: "Não lidas" },
  { value: "read", label: "Lidas" },
]

const typeOptions: Array<{ value: NotificationCategory | "all"; label: string }> = [
  { value: "all", label: "Tipo" },
  { value: "ticket", label: "Tickets" },
  { value: "message", label: "Mensagens" },
  { value: "team", label: "Equipe" },
  { value: "system", label: "Sistema" },
]

export const NotificationsPage = ({ notifications }: NotificationsPageProps) => {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<NotificationStatus | "all">("all")
  const [category, setCategory] = useState<NotificationCategory | "all">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<AppNotification | null>(null)

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(search.toLowerCase()) ||
        notification.message.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = status === "all" ? true : notification.status === status
      const matchesCategory =
        category === "all" ? true : notification.category === category

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [notifications, search, status, category])

  const handleOpenDetails = (notification: AppNotification) => {
    setSelected(notification)
    setDialogOpen(true)
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
        </div>
      </div>

      <div className="space-y-3">
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
      </div>

      <NotificationDialog
        notification={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  )
}
