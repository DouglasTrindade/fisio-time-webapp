"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

type BorderStyle = "solid" | "dashed" | "dotted" | "double";

type BorderSize = "0" | "2" | "4" | "8";

interface SeparatorProps
  extends React.ComponentProps<typeof SeparatorPrimitive.Root> {
  border?: BorderStyle;
  borderSize?: BorderSize;
}

function Separator({
  className,
  orientation = "horizontal",
  border = "solid",
  borderSize = "0",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        `bg-border border shrink-0 
         data-[orientation=horizontal]:h-px 
         data-[orientation=horizontal]:w-full 
         data-[orientation=vertical]:h-full 
         data-[orientation=vertical]:w-px`,
        `border-${borderSize}`,
        `border-${border}`,
        className
      )}
      {...props}
    />
  );
}

export { Separator };
