"use client";

import { logout } from "../../../actions/SignIn";

export const SignOutButton = () => {
  return (
    <button
      type="button"
      className="py-2 px-3 bg-purple-700 cursor-pointer rounded"
      onClick={() => logout()}
    >
      Sign Out
    </button>
  );
};
