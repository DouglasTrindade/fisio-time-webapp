"use server";

import { signIn } from "../auth";

export const SignInAction = async () => {
  await signIn("github", { redirectTo: "/" });
};
