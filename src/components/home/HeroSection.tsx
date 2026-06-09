import { Heart, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-0 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7">
      <div className="pointer-events-none absolute left-4 top-12 h-20 w-20 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-500/10 sm:h-28 sm:w-28" />
      <div className="pointer-events-none absolute right-2 top-8 h-24 w-24 rounded-full bg-sky-100/70 blur-3xl dark:bg-sky-400/10 sm:right-10 sm:h-32 sm:w-32" />
      <div className="pointer-events-none absolute left-[8%] top-28 hidden h-20 w-20 rounded-[2rem] border border-blue-100 bg-white/40 dark:border-blue-400/10 dark:bg-blue-400/5 sm:block" />
      <div className="pointer-events-none absolute right-[14%] top-32 hidden grid-cols-4 gap-2 opacity-25 md:grid">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        ))}
      </div>
      <svg className="pointer-events-none absolute bottom-0 left-0 -z-10 h-16 w-full text-blue-100/30 dark:text-blue-500/10 sm:h-24" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0,160L60,154.7C120,149,240,139,360,149.3C480,160,600,192,720,186.7C840,181,960,139,1080,128C1200,117,1320,139,1380,149.3L1440,160L1440,320L0,320Z" />
      </svg>
      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mb-1 text-base font-black text-slate-800 dark:text-slate-100 sm:text-xl">Chào mừng đến với</p>
        <h1 className="text-5xl font-black text-[#2EAFFF] sm:text-6xl lg:text-[4.5rem]">CHẠM</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-8">
          Khám phá từ vựng và học ngôn ngữ ký hiệu mỗi ngày.
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-blue-300 sm:mt-3">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          <span className="h-1 w-12 rounded-full bg-blue-200 sm:w-16" />
          <Heart className="h-5 w-5 fill-blue-100 sm:h-6 sm:w-6" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
