import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./app/(auth)/domain/SignIn/Schema";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default {
  providers: [
    GitHub,
    Credentials({
      authorize: async (credentials) => {
        const { data, success } = signInSchema.safeParse(credentials);

        if (!success) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: data.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const isValid = await bcrypt.compare(data.password, user.password);

        if (!isValid) {
          throw new Error("INVALID_CREDENTIALS");
        }

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
