import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-5 pt-10 sm:px-6 sm:pb-6 sm:pt-8 lg:px-8 lg:pb-2 lg:pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-blue-100/80 via-blue-50/45 to-transparent dark:from-blue-500/10 dark:via-slate-900/20 sm:h-48" />
      <div className="pointer-events-none absolute left-1/2 top-8 -z-10 h-40 w-[min(34rem,90vw)] -translate-x-1/2 rounded-full bg-sky-100/80 blur-3xl dark:bg-sky-500/10 sm:h-28" />
      <div className="pointer-events-none absolute left-2 top-20 -z-10 h-24 w-24 rounded-full bg-blue-100/80 blur-2xl dark:bg-blue-500/10 sm:left-4 sm:top-14 sm:h-24 sm:w-24" />
      <div className="pointer-events-none absolute right-2 top-16 -z-10 h-28 w-28 rounded-full bg-cyan-100/80 blur-2xl dark:bg-cyan-500/10 sm:right-4 sm:top-12 sm:h-28 sm:w-28" />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mb-2 inline-flex items-center justify-center gap-2 rounded-full bg-white/80 px-4 py-2 text-base font-black text-slate-800 shadow-sm shadow-blue-100/60 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-none sm:bg-transparent sm:px-0 sm:py-0 sm:text-xl sm:shadow-none">
          <Sparkles className="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" aria-hidden="true" />
          Chào mừng đến với
        </p>
        <h1 className="text-[4.75rem] font-black leading-none tracking-normal text-[#2EAFFF] drop-shadow-sm sm:text-6xl lg:text-[4.5rem]">CHẠM</h1>
        <p className="mx-auto mt-4 max-w-xl text-base font-bold leading-8 text-slate-700 dark:text-slate-300 sm:mt-2 sm:text-base sm:font-semibold">
          Khám phá từ vựng và học ngôn ngữ ký hiệu mỗi ngày.
        </p>
        <div className="mx-auto mt-5 grid max-w-sm gap-3 sm:mt-4 sm:max-w-none sm:grid-cols-[auto_auto] sm:justify-center">
          <Button asChild size="lg" className="min-h-12 rounded-full px-6 text-base">
            <Link href="/khoa-hoc/tu-vung">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Bắt đầu học
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="min-h-12 rounded-full px-6 text-base">
            <Link href="/tu-dien">
              Từ điển
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
