"use client";

import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";

export default function ThemeToggler() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <FaSun className="absolute w-10 h-10 text-yellow-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />

      <FaMoon className="absolute w-10 h-10 text-gray-800 scale-0 rotate-90 dark:-rotate-0 dark:scale-100" />
    </Button>
  );
}
