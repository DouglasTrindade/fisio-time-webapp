import { z } from "zod"

export const notificationSettingsSchema = z.object({
  preference: z.enum(["all", "direct", "none"]).default("all"),
  emailCommunication: z.boolean().default(true),
  emailMarketing: z.boolean().default(false),
  emailSocial: z.boolean().default(true),
  emailSecurity: z.boolean().default(false),
})

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>
