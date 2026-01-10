import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./app/(auth)/domain/SignIn/Schema";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 5 * 60 * 1000;

const loginAttemptCache = new Map<
  string,
  {
    attempts: number;
    lockUntil: number;
  }
>();

function checkLock(key: string) {
  const entry = loginAttemptCache.get(key);
  if (!entry) {
    return false;
  }

  if (entry.lockUntil && entry.lockUntil > Date.now()) {
    return true;
  }

  if (entry.lockUntil && entry.lockUntil <= Date.now()) {
    loginAttemptCache.delete(key);
  }

  return false;
}

function registerFailure(key: string) {
  const entry = loginAttemptCache.get(key);
  if (!entry) {
    loginAttemptCache.set(key, {
      attempts: 1,
      lockUntil: 0,
    });
    return;
  }

  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockUntil = Date.now() + LOCK_WINDOW_MS;
  }
}

function registerSuccess(key: string) {
  loginAttemptCache.delete(key);
}

export default {
  providers: [
    GitHub,
    Credentials({
      authorize: async (credentials) => {
        const { data, success } = signInSchema.safeParse(credentials);

        if (!success) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const identifier = data.email.toLowerCase();
        if (checkLock(identifier)) {
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: data.email,
          },
        });

        if (!user || !user.password) {
          registerFailure(identifier);
          throw new Error("INVALID_CREDENTIALS");
        }

        const isValid = await bcrypt.compare(data.password, user.password);

        if (!isValid) {
          registerFailure(identifier);
          throw new Error("INVALID_CREDENTIALS");
        }

        registerSuccess(identifier);
        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
