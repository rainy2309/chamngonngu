import { Heart, Sparkles } from "lucide-react";
import { ChamLogo } from "@/components/common/ChamLogo";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-8 pt-14 sm:px-6 lg:px-8">
      <div className="absolute left-4 top-20 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute right-10 top-12 h-52 w-52 rounded-full bg-sky-100/70 blur-3xl" />
      <div className="absolute left-[8%] top-52 hidden h-28 w-28 rounded-[2rem] border border-blue-100 bg-white/40 sm:block" />
      <div className="absolute right-[14%] top-56 hidden grid-cols-4 gap-2 opacity-40 md:grid">
        {Array.from({ length: 16 }).map((_, index) => <span key={index} className="h-1.5 w-1.5 rounded-full bg-blue-400" />)}
      </div>
      <svg className="absolute bottom-0 left-0 -z-10 h-72 w-full text-blue-100/70" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0,160L60,154.7C120,149,240,139,360,149.3C480,160,600,192,720,186.7C840,181,960,139,1080,128C1200,117,1320,139,1380,149.3L1440,160L1440,320L0,320Z" />
      </svg>
      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-lg shadow-blue-100">
          <ChamLogo className="h-9 w-9 shadow-none" />
          <span>Học ký hiệu qua hình ảnh, từ vựng và hoạt động tương tác</span>
        </div>
        <p className="mb-2 text-3xl font-black text-slate-800 sm:text-5xl">Welcome to</p>
        <h1 className="text-7xl font-black tracking-tight text-blue-600 sm:text-8xl lg:text-9xl">CHẠM</h1>
        <p className="mx-auto mt-5 max-w-3xl text-xl leading-9 text-slate-600 sm:text-2xl">Khám phá từ vựng, học ký hiệu và kết nối trực quan hơn mỗi ngày.</p>
        <div className="mt-8 flex items-center justify-center gap-5 text-blue-300">
          <Sparkles className="h-8 w-8" aria-hidden="true" />
          <span className="h-1 w-24 rounded-full bg-blue-200" />
          <Heart className="h-8 w-8 fill-blue-100" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
