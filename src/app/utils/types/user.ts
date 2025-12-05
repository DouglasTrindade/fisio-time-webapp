import type { User } from "@prisma/client";

export type UserProfile = Pick<User, "id" | "name" | "email" | "image">;

export interface UserUpdateInput {
  name: string;
  email: string;
  image?: string | null;
}
