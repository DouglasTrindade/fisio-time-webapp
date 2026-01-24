import NextAuth from "next-auth";
import authConfig from "./auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Role, User } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

const prismaAdapter = PrismaAdapter(prisma) as Adapter;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: prismaAdapter,
  ...authConfig,
  session: { strategy: "jwt", maxAge: 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const typedUser = user as User;
        token.id = typedUser.id;
        token.role = typedUser.role as Role;
      }
      return token;
    },
    session({ session, token }) {
      const expiration = typeof token.exp === "number" ? token.exp * 1000 : null;

      session.user.id = token.id as string;
      session.user.role = (token.role as Role) ?? "PROFESSIONAL";
      if (expiration) {
        session.expires = new Date(expiration).toISOString() as unknown as Date & string;
        if (Date.now() >= expiration) {
          session.expires = new Date() as unknown as Date & string;;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
