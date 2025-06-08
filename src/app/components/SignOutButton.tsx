"use client";

import { SignOut } from "@/actions/SignOut";

export const SignOutButton = () => {
  return (
    <button
      type="button"
      className="py-2 px-3 bg-purple-700 cursor-pointer rounded"
      onClick={() => SignOut()}
    >
      Sign Out
    </button>
  );
};
