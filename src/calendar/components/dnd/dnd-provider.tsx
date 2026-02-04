"use client";

interface DndProviderWrapperProps {
  children: React.ReactNode;
}

export function DndProviderWrapper({ children }: DndProviderWrapperProps) {
  return <>{children}</>;
}
