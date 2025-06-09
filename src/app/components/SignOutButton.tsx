"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <Button onClick={handleSignOut} className="bg-red-500">
      Sign Out
    </Button>
  );
}
