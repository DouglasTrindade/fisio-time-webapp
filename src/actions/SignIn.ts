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
      const errorCode = err.cause?.err?.message ?? err.message;
      const errorMessage = (() => {
        switch (errorCode) {
          case "INVALID_CREDENTIALS":
            return "Credenciais inválidas.";
          case "USER_NOT_FOUND":
            return "Usuário não encontrado.";
          case "INVALID_PASSWORD":
            return "Senha inválida.";
          default:
            return "Não foi possível autenticar. Tente novamente.";
        }
      })();
      return { error: errorMessage };
    }
    return { error: "Erro interno ao autenticar. Tente novamente." };
  }
};
