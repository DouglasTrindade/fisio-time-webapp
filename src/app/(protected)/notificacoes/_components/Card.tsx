"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { NotificationCategory, AppNotification } from "@/app/types/notification"
import {
  Bell,
  MessageSquare,
  Ticket,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

type NotificationCardRootProps = React.HTMLAttributes<HTMLDivElement> & {
  unread?: boolean
  highlight?: boolean
  asChild?: boolean
}

const NotificationCardRoot = React.forwardRef<HTMLDivElement, NotificationCardRootProps>(
  ({ className, unread, highlight, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        className={cn(
          "group relative flex gap-3 rounded-xl border border-border/60 bg-card/80 p-4 text-left transition hover:border-primary/50",
          unread && "shadow-[0_0_0_1px_rgba(234,179,8,0.35)]",
          highlight && "bg-primary/5",
          className,
        )}
        {...props}
      />
    )
  },
)
NotificationCardRoot.displayName = "NotificationCardRoot"

const circleVariants: Record<NotificationCategory, string> = {
  ticket: "bg-blue-500/15 text-blue-300",
  message: "bg-green-500/15 text-green-300",
  team: "bg-purple-500/15 text-purple-300",
  system: "bg-orange-500/15 text-orange-300",
}

const iconMap: Record<NotificationCategory, LucideIcon> = {
  ticket: Ticket,
  message: MessageSquare,
  team: UsersRound,
  system: Bell,
}

const NotificationCardMedia = ({
  notification,
}: {
  notification: AppNotification
}) => {
  if (notification.actor?.avatar) {
    const initials = notification.actor.name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("")

    return (
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    )
  }

  const Icon = iconMap[notification.category] ?? Bell
  const styles = circleVariants[notification.category] ?? circleVariants.system

  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg",
        styles,
      )}
    >
      <Icon className="h-5 w-5" />
    </div>
  )
}

const NotificationCardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-1 flex-col gap-1", className)} {...props} />
)

const NotificationCardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("font-semibold text-foreground", className)} {...props} />
)

const NotificationCardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)

const NotificationCardMeta = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-wrap items-center gap-2 text-xs text-muted-foreground", className)}
    {...props}
  />
)

const NotificationCardActions = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-2 flex flex-wrap gap-2", className)} {...props} />
)

const NotificationCardStatus = ({
  unread,
}: {
  unread?: boolean
}) =>
  unread ? (
    <span className="absolute right-4 top-4 inline-flex h-2 w-2 rounded-full bg-rose-500" />
  ) : null

export const NotificationCard = {
  Root: NotificationCardRoot,
  Content: NotificationCardContent,
  Title: NotificationCardTitle,
  Description: NotificationCardDescription,
  Meta: NotificationCardMeta,
  Actions: NotificationCardActions,
  Media: NotificationCardMedia,
  Status: NotificationCardStatus,
}
