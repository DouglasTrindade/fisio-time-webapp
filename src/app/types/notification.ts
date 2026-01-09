export type NotificationCategory = "ticket" | "message" | "team" | "system";
export type NotificationStatus = "unread" | "read";
export type NotificationPriority = "low" | "normal" | "high";

export interface NotificationAction {
  id: string;
  label: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
}

export interface NotificationActor {
  name: string;
  avatar?: string | null;
  role?: string | null;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  status: NotificationStatus;
  category: NotificationCategory;
  channel: string;
  priority?: NotificationPriority;
  timestamp: string;
  highlight?: boolean;
  actor?: NotificationActor;
  actions?: NotificationAction[];
}
