"use client";

import { login } from "@/lib/actions/auth";

export const SignInButton = () => {
  return (
    <button
      type="button"
      className="py-2 px-3 bg-purple-700 cursor-pointer rounded"
      onClick={() => login()}
    >
      Login with Github
    </button>
  );
};
