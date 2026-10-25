"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./button";

export default function ThemeToggler({
  variant = "ghost",
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      {...props}
      onClick={(e) => {
        setTheme(theme === "dark" ? "light" : "dark");
        if (onClick) {
          onClick(e);
        }
      }}
      size={"icon-sm"}
      variant={variant}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
