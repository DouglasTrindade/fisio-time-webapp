"use client";

import { useBreadcrumb } from "../context";
import { ChevronRight } from "lucide-react";

export const Breadcrumb = () => {
  const { items } = useBreadcrumb();

  return (
    <nav className="text-sm text-muted-foreground">
      {items.map((item, index) => (
        <span key={index}>
          {item}
          {index < items.length - 1 && <ChevronRight />}
        </span>
      ))}
    </nav>
  );
};
