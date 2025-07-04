"use server";

import { SignUpSchema, signUpSchema } from "@/app/(auth)/domain/SignUp/Schema";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export const SignUpAction = async (values: SignUpSchema) => {
  try {
    const { data, success } = signUpSchema.safeParse(values);

    if (!success) return { error: "Invalid data" };

    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (user) return { error: "User already exists" };

    const passwordHash = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: passwordHash,
      },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: err.cause?.err?.message };
    }
    return { error: "error 500" };
  }
};
