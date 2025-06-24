"use client";

import { usePathname } from "next/navigation";

export const Breadcrumbs = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");

  return (
    <nav>
      {segments.map((segment, index) => (
        <span key={index}>{segment}</span>
      ))}
    </nav>
  );
};
