import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";

const prisma = new PrismaClient();

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "E-mail",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Senha",
          placeholder: "*****",
        },
      },

      authorize: async (credentials) => {
        const email = "admin@mail.com";
        const password = "123456";

        if (credentials.email === email && credentials.password === password) {
          return { email, password };
        } else {
          throw new Error("Invalid credentials.");
        }
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
});
