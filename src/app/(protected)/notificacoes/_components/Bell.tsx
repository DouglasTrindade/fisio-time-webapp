import { cache, Suspense } from "react"

import { NotificationsDropdown } from "./Dropdown"
import { getRecentNotifications } from "../server"

const getCachedNotifications = cache(async () => {
  return getRecentNotifications()
})

async function NotificationsBellContent() {
  const notifications = await getCachedNotifications()
  return <NotificationsDropdown notifications={notifications} />
}

const NotificationsFallback = () => (
  <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-muted/30">
    <div className="h-4 w-4 animate-ping rounded-full bg-muted-foreground/40" />
  </div>
)

export const NotificationsBell = () => {
  return (
    <Suspense fallback={<NotificationsFallback />}>
      <NotificationsBellContent />
    </Suspense>
  )
}
