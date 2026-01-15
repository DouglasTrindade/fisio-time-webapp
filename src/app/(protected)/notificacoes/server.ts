import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { mapNotificationToApp } from "./mapper"

export const getRecentNotifications = async (limit = 5) => {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const notifications = await prisma.notification.findMany({
    where: {
      recipientId: session.user.id,
      OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }],
    },
    take: limit,
    orderBy: {
      sentAt: "desc",
    },
    include: {
      sender: true,
      recipient: true,
    },
  })

  return notifications.map(mapNotificationToApp)
}
