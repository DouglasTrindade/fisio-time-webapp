export type NotificationCategory = "system" | "finance" | "attendance" | "message"
export type NotificationStatus = "unread" | "read"
export type NotificationPriority = "low" | "normal" | "high"

export interface NotificationAction {
  id: string
  label: string
  variant?: "default" | "outline" | "secondary" | "destructive"
}

export interface NotificationActor {
  name: string
  avatar?: string | null
  role?: string | null
}

export interface NotificationRecipient {
  id: string
  name: string
  email?: string | null
}

export interface AppNotification {
  id: string
  title: string
  message: string
  status: NotificationStatus
  category: NotificationCategory
  channel: string
  priority?: NotificationPriority
  timestamp: string
  highlight?: boolean
  actor?: NotificationActor
  recipient?: NotificationRecipient
  sendMode?: "now" | "scheduled"
  scheduledFor?: string | null
  includeEmail?: boolean
  actions?: NotificationAction[]
}
