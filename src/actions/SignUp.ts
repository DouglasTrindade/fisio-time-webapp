"use server";

import { SignUpSchema, signUpSchema } from "@/app/(auth)/domain/SignUp/Schema";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { Role } from "@prisma/client";

export const SignUpAction = async (values: SignUpSchema) => {
  try {
    const { data, success } = signUpSchema.safeParse(values);

    if (!success) return { error: "Invalid data" };

    const normalizedEmail = data.email.toLowerCase()

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (user) return { error: "User already exists" };

    const passwordHash = await bcrypt.hash(data.password, 10);

    let assignedRole: Role = Role.PROFESSIONAL;
    let inviteId: string | null = null;

    if (data.inviteToken) {
      const invite = await prisma.userInvite.findUnique({
        where: { token: data.inviteToken },
      });

      if (!invite) {
        return { error: "Convite inválido ou expirado" };
      }

      if (invite.acceptedAt) {
        return { error: "Este convite já foi utilizado" };
      }

      if (invite.expiresAt < new Date()) {
        return { error: "O convite expirou, solicite um novo" };
      }

      if (invite.email.toLowerCase() !== data.email.toLowerCase()) {
        return { error: "E-mail não corresponde ao convite" };
      }

      assignedRole = invite.role;
      inviteId = invite.id;
    }

    const createdUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: data.name,
        password: passwordHash,
        role: assignedRole,
      },
    });

    if (inviteId) {
      await prisma.userInvite.update({
        where: { id: inviteId },
        data: {
          acceptedAt: new Date(),
          invitedUserId: createdUser.id,
        },
      });
    }

    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: err.cause?.err?.message };
    }
    return { error: "error 500" };
  }
};
