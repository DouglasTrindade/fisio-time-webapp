import type { Role, User, UserInvite } from "@prisma/client";

export type UserProfile = Pick<User, "id" | "name" | "email" | "image" | "role" | "createdAt">;

export interface UserUpdateInput {
  name: string;
  email: string;
  image?: string | null;
}

export type AppRole = Role;

export type UserInviteSummary = Pick<
  UserInvite,
  "id" | "email" | "role" | "token" | "createdAt" | "expiresAt" | "acceptedAt"
> & {
  createdBy?: Pick<User, "id" | "name" | "email"> | null;
};
