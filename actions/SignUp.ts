"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/app/(auth)/domain/SignUp/Schema";

export const SignUpAction = async (data: z.infer<typeof signUpSchema>) => {
  try {
    const validatedData = signUpSchema.parse(data);
    const { email, name, password } = validatedData;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return { error: "E-mail já está em uso" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const lowerCaseEmail = email.toLowerCase();

    await prisma.user.create({
      data: {
        name,
        email: lowerCaseEmail,
        password: hashedPassword,
      },
    });

    return { success: "Usuário registrado com sucesso" };
  } catch (error) {
    console.error("Erro no SignUpAction:", error);
    if (error instanceof z.ZodError) {
      return { error: "Erro de validação" };
    }

    return { error: "Erro interno no servidor" };
  }
};
