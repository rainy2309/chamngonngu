import { HeroSection } from "@/components/home/HeroSection";
import { HomeTabs } from "@/components/home/HomeTabs";
import { SearchSection } from "@/components/home/SearchSection";

export default function Home() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <HeroSection />
      <SearchSection />
      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <HomeTabs />
      </div>
      <section id="ve-cham" className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-lg shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:p-6">
          <p className="text-xs font-black uppercase text-blue-600 dark:text-blue-300">Về dự án</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Về CHẠM</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            CHẠM là dự án hỗ trợ học ngôn ngữ ký hiệu Việt Nam thông qua từ vựng, bài học trực quan và hoạt động luyện tập đơn giản. Dự án hướng đến người mới học, sinh viên và cộng đồng muốn giao tiếp thân thiện hơn với người khiếm thính.
          </p>
          <p className="mt-3 text-sm font-semibold leading-7 text-blue-700 dark:text-blue-200">
            Được thực hiện bởi nhóm sinh viên với mục tiêu lan tỏa sự thấu hiểu và kết nối.
          </p>
        </div>
      </section>
    </main>
  );
}
