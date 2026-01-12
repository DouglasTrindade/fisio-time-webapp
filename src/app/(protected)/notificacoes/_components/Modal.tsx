"use client"

import type { AppNotification } from "@/types/notification"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface NotificationDialogProps {
  notification: AppNotification | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NotificationDialog = ({
  notification,
  open,
  onOpenChange,
}: NotificationDialogProps) => {
  const timeAgo = notification
    ? formatDistanceToNow(new Date(notification.timestamp), {
      addSuffix: true,
      locale: ptBR,
    })
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{notification?.title ?? "Notificação"}</DialogTitle>
          <DialogDescription>{timeAgo}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">{notification?.message}</p>

          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Categoria:{" "}
            <span className="text-foreground">{notification?.channel ?? "Geral"}</span>
          </div>
        </div>

        {notification?.actions?.length ? (
          <DialogFooter className="gap-2 sm:gap-3">
            {notification.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant ?? "default"}
                size="sm"
              >
                {action.label}
              </Button>
            ))}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
