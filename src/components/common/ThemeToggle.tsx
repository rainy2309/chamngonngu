"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

const storageKey = "cham_theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(storageKey);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const nextTheme = getInitialTheme() as "light" | "dark";
    setTheme(nextTheme);

    if (isAdmin) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      return;
    }

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
  }, [isAdmin]);

  useEffect(() => {
    if (!mounted || isAdmin) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem(storageKey, theme);
  }, [isAdmin, mounted, theme]);

  if (!mounted || isAdmin) return null;

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="fixed bottom-4 left-4 z-50 grid h-12 w-12 place-items-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-xl shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-slate-800 sm:bottom-5 sm:left-5"
      aria-label="Chuyển giao diện sáng/tối"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
