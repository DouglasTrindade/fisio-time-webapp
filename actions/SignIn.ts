"use server";

import * as z from "zod";
import { signIn } from "@/auth";
import { signInSchema } from "@/app/(auth)/domain/SignIn/Schema";
import { AuthError } from "next-auth";

export const SignInAction = async (data: z.infer<typeof signInSchema>) => {
  try {
    const validatedData = signInSchema.parse(data);

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return { error: "Email ou senha incorretos." };
      }
      return { error: "Erro de autenticação." };
    }

    return { error: "Erro inesperado. Tente novamente." };
  }
};
