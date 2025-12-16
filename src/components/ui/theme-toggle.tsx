"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mode = resolvedTheme ?? theme;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/70 text-slate-700 shadow-sm transition hover:scale-105 hover:text-amber-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-amber-100",
        className,
      )}
      aria-label="Toggle theme"
      disabled={!mounted}
    >
      {mounted ? (
        isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
