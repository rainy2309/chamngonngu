"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalNavigationProps = {
  open: boolean;
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  variant?: "all" | "desktop" | "mobile";
  enableKeyboard?: boolean;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
}

export function ModalNavigation({ open, currentIndex, total, onPrevious, onNext, variant = "all", enableKeyboard = true }: ModalNavigationProps) {
  const canPrevious = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < total - 1;
  const label = currentIndex >= 0 && total > 0 ? `${currentIndex + 1}/${total}` : "0/0";
  const showDesktop = variant === "all" || variant === "desktop";
  const showMobile = variant === "all" || variant === "mobile";

  useEffect(() => {
    if (!open || !enableKeyboard) return;

    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      if (event.key === "ArrowLeft" && canPrevious) {
        event.preventDefault();
        onPrevious();
      }
      if (event.key === "ArrowRight" && canNext) {
        event.preventDefault();
        onNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canNext, canPrevious, enableKeyboard, onNext, onPrevious, open]);

  return (
    <>
      {showDesktop ? (
        <>
          <div className="pointer-events-none absolute -left-14 -right-14 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-between lg:flex xl:-left-16 xl:-right-16">
            <button
              type="button"
              disabled={!canPrevious}
              onClick={onPrevious}
              className={cn(
                "pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-slate-950/70 text-white shadow-2xl shadow-slate-950/25 backdrop-blur-md transition hover:-translate-x-0.5 hover:bg-blue-700/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:border-white/10 dark:bg-white/15 dark:text-white dark:hover:bg-blue-500/80",
                !canPrevious && "cursor-not-allowed opacity-35 hover:translate-x-0 hover:bg-slate-950/70 dark:hover:bg-white/15",
              )}
              aria-label="Mục trước"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={onNext}
              className={cn(
                "pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-slate-950/70 text-white shadow-2xl shadow-slate-950/25 backdrop-blur-md transition hover:translate-x-0.5 hover:bg-blue-700/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:border-white/10 dark:bg-white/15 dark:text-white dark:hover:bg-blue-500/80",
                !canNext && "cursor-not-allowed opacity-35 hover:translate-x-0 hover:bg-slate-950/70 dark:hover:bg-white/15",
              )}
              aria-label="Mục tiếp theo"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <span className="absolute right-16 top-4 z-10 hidden rounded-full border border-blue-100 bg-white/90 px-3 py-1 text-xs font-black text-blue-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-blue-100 lg:inline-flex">
            {label}
          </span>
        </>
      ) : null}

      {showMobile ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-2 dark:border-slate-700 dark:bg-slate-800 lg:hidden">
          <button
            type="button"
            disabled={!canPrevious}
            onClick={onPrevious}
            className={cn(
              "min-h-10 rounded-full bg-white px-3 text-sm font-black text-blue-700 shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-900 dark:text-blue-100",
              !canPrevious && "cursor-not-allowed opacity-45",
            )}
            aria-label="Mục trước"
          >
            ← Trước
          </button>
          <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-100">{label}</span>
          <button
            type="button"
            disabled={!canNext}
            onClick={onNext}
            className={cn(
              "min-h-10 rounded-full bg-white px-3 text-sm font-black text-blue-700 shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-900 dark:text-blue-100",
              !canNext && "cursor-not-allowed opacity-45",
            )}
            aria-label="Mục tiếp theo"
          >
            Tiếp →
          </button>
        </div>
      ) : null}
    </>
  );
}
