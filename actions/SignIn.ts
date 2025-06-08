"use server";

import { signIn } from "@/auth";
import { SignInSchema } from "@/app/(auth)/domain/SignIn/Schema";
import { AuthError } from "next-auth";

export const SignInAction = async (data: SignInSchema) => {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: err.cause?.err?.message };
    }
    return { error: "error 500" };
  }
};
