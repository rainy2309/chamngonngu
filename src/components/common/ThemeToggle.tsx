"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

const storageKey = "cham_theme";
const themeChangingClass = "theme-changing";

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

  function applyTheme(nextTheme: "light" | "dark", save = true) {
    const root = document.documentElement;
    root.classList.add(themeChangingClass);
    root.classList.toggle("dark", nextTheme === "dark");
    root.classList.toggle("light", nextTheme === "light");
    if (save) window.localStorage.setItem(storageKey, nextTheme);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.remove(themeChangingClass));
    });
  }

  useEffect(() => {
    setMounted(true);

    if (isAdmin) {
      applyTheme("light", false);
      return;
    }

    const nextTheme = getInitialTheme() as "light" | "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme, false);
  }, [isAdmin]);

  if (!mounted || isAdmin) return null;

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-xl shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-slate-800 sm:bottom-5 sm:left-5 sm:right-auto sm:h-12 sm:w-12"
      aria-label="Chuyển giao diện sáng/tối"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
