"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

type ModeToggleProps = {
  label?: string;
};

export function ModeToggle({ label = "Tema" }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const iconState = theme === "dark" ? "dark" : "light";

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2 [&>svg:last-child]:hidden cursor-pointer">
        <span className="relative flex h-4 w-4 items-center justify-center">
          <Sun
            className="h-4 w-4 rotate-0 scale-100 transition-all data-[state=dark]:-rotate-90 data-[state=dark]:scale-0"
            data-state={iconState}
            color="gray"
          />
          <Moon
            className="absolute h-4 w-4 rotate-90 scale-0 transition-all data-[state=dark]:rotate-0 data-[state=dark]:scale-100"
            data-state={iconState}
            color="gray"
          />
          <span className="sr-only">Alternar tema</span>
        </span>
        <span>{label}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent alignOffset={-4} className="min-w-32">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
