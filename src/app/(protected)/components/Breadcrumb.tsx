"use client";

import { usePathname } from "next/navigation";
import { MoveRight } from "lucide-react";


export const Breadcrumbs = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");

  const visibleSegments = segments.filter((segment) => segment.length > 0)

  return (
    <nav className="flex items-center w-full">
      {visibleSegments.map((segment, index) => (
        <span className="flex items-center capitalize" key={`${segment}-${index}`}>
          {segment}
          {index < visibleSegments.length - 1 ? <> <MoveRight className="mx-2" size={15} /> </> : ""}
        </span>
      ))}
    </nav>
  )
};
