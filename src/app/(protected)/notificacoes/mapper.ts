import type { Notification, User } from "@prisma/client"

import type {
  AppNotification,
  NotificationCategory as AppCategory,
  NotificationPriority as AppPriority,
  NotificationStatus as AppStatus,
} from "@/types/notification"

export type NotificationWithRelations = Notification & {
  sender?: Pick<User, "id" | "name" | "image"> | null
  recipient?: Pick<User, "id" | "name" | "email"> | null
}

const channelLabels: Record<AppCategory, string> = {
  system: "Sistema",
  finance: "Financeiro",
  attendance: "Atendimentos",
  message: "Mensagens",
}

const toCategory = (value: Notification["category"]): AppCategory =>
  value.toLowerCase() as AppCategory

const toStatus = (value: Notification["status"]): AppStatus =>
  value.toLowerCase() as AppStatus

const toPriority = (value: Notification["priority"]): AppPriority =>
  value.toLowerCase() as AppPriority

const toSendMode = (value: Notification["sendMode"]): "now" | "scheduled" =>
  value.toLowerCase() as "now" | "scheduled"

export const mapNotificationToApp = (
  notification: NotificationWithRelations,
): AppNotification => {
  const category = toCategory(notification.category)
  const status = toStatus(notification.status)
  const priority = toPriority(notification.priority)
  const sendMode = toSendMode(notification.sendMode)

  const timestamp = (
    notification.sentAt ??
    notification.scheduledFor ??
    notification.createdAt
  ).toISOString()

  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    status,
    category,
    channel: notification.channel ?? channelLabels[category],
    priority,
    timestamp,
    highlight: notification.highlight,
    actor: notification.sender
      ? {
          name: notification.sender.name ?? "Profissional",
          avatar: notification.sender.image,
        }
      : undefined,
    recipient: notification.recipient
      ? {
          id: notification.recipient.id,
          name: notification.recipient.name ?? "Profissional",
          email: notification.recipient.email,
        }
      : undefined,
    sendMode,
    scheduledFor: notification.scheduledFor
      ? notification.scheduledFor.toISOString()
      : null,
    includeEmail: notification.includeEmail,
  }
}

export { channelLabels }
