"use client";
import * as React from "react";

import { signOut } from "next-auth/react";

export interface SignOutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function SignOutButton({ children, className }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <span onClick={handleSignOut} className={className}>
      {children}
    </span>
  );
}
