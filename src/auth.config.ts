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
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: data.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(data.password, user.password);

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
