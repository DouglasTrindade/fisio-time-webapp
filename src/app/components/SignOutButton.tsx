"use client";

import { signOut } from "next-auth/react";

export interface SignOutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function SignOutButton({ children, className }: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/sign-in", redirect: true });
  };

  return (
    <span onClick={handleSignOut} className={className}>
      {children}
    </span>
  );
}
