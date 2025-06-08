import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
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
} satisfies NextAuthConfig;
