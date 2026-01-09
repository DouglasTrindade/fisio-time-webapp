"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Bell, Eye } from "lucide-react"

import type { AppNotification } from "@/app/types/notification"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { NotificationCard } from "./Card"
import { NotificationDialog } from "./Modal"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface NotificationsDropdownProps {
  notifications: AppNotification[]
}

export const NotificationsDropdown = ({
  notifications,
}: NotificationsDropdownProps) => {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<AppNotification | null>(null)

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status === "unread").length,
    [notifications],
  )

  const handleSelect = (notification: AppNotification) => {
    setSelected(notification)
    setDialogOpen(true)
    setOpen(false)
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-muted"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-rose-500" />
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-96 overflow-hidden rounded-xl border bg-card p-0 shadow-xl"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notificações</p>
              <p className="text-xs text-muted-foreground">
                {unreadCount} não lida{unreadCount === 1 ? "" : "s"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-mr-2 text-xs font-medium"
            >
              <Link href="/notificacoes" className="inline-flex items-center gap-1">
                Ver todas
                <Eye className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <Separator />
          <div className="max-h-96 space-y-2 overflow-y-auto p-4">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className="w-full text-left"
                onClick={() => handleSelect(notification)}
              >
                <NotificationCard.Root
                  unread={notification.status === "unread"}
                  highlight={notification.highlight}
                  className="p-3"
                >
                  <NotificationCard.Status unread={notification.status === "unread"} />
                  <NotificationCard.Media notification={notification} />
                  <NotificationCard.Content>
                    <NotificationCard.Title className="text-sm">
                      {notification.title}
                    </NotificationCard.Title>
                    <NotificationCard.Description className="text-xs">
                      {notification.message}
                    </NotificationCard.Description>
                    <NotificationCard.Meta className="text-[0.7rem]">
                      <span>{notification.channel}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </NotificationCard.Meta>
                  </NotificationCard.Content>
                </NotificationCard.Root>
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDialog
        notification={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
