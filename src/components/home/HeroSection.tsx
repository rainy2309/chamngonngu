import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-2 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-blue-100/60 via-blue-50/35 to-transparent dark:from-blue-500/10 dark:via-slate-900/20" />
      <div className="pointer-events-none absolute left-1/2 top-5 -z-10 h-28 w-[min(30rem,80vw)] -translate-x-1/2 rounded-full bg-sky-100/70 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute left-4 top-14 -z-10 h-16 w-16 rounded-full bg-blue-100/70 blur-2xl dark:bg-blue-500/10 sm:h-24 sm:w-24" />
      <div className="pointer-events-none absolute right-4 top-12 -z-10 h-20 w-20 rounded-full bg-cyan-100/70 blur-2xl dark:bg-cyan-500/10 sm:h-28 sm:w-28" />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mb-1 inline-flex items-center justify-center gap-2 text-base font-black text-slate-800 dark:text-slate-100 sm:text-xl">
          <Sparkles className="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" aria-hidden="true" />
          Chào mừng đến với
        </p>
        <h1 className="text-5xl font-black text-[#2EAFFF] sm:text-6xl lg:text-[4.5rem]">CHẠM</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-8">
          Khám phá từ vựng và học ngôn ngữ ký hiệu mỗi ngày.
        </p>
      </div>
    </section>
  );
}
