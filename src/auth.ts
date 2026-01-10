import NextAuth from "next-auth";
import authConfig from "./auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  session: { strategy: "jwt", maxAge: 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      const expiration = typeof token.exp === "number" ? token.exp * 1000 : null;

      session.user.id = token.id as string;
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
