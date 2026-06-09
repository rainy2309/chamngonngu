import { CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeTabs } from "@/components/home/HomeTabs";
import { SearchSection } from "@/components/home/SearchSection";

const aboutItems = [
  { label: "Mục tiêu", text: "hỗ trợ học ký hiệu dễ tiếp cận hơn", icon: CheckCircle2 },
  { label: "Đối tượng", text: "người mới học, sinh viên, cộng đồng quan tâm", icon: GraduationCap },
  { label: "Ghi chú", text: "dữ liệu ký hiệu trong bản demo cần được xác minh bởi nguồn chuyên môn", icon: ShieldCheck },
];

export default function Home() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white">
      <HeroSection />
      <SearchSection />
      <div className="px-4 pb-10 sm:px-6 lg:px-8">
        <HomeTabs />
      </div>
      <section id="ve-cham" className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase text-blue-600">Về dự án</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Về CHẠM</h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-8 text-slate-600">
                CHẠM là dự án học ngôn ngữ ký hiệu trực quan, giúp người dùng tra cứu từ vựng, học ký hiệu cơ bản và nâng cao nhận thức về giao tiếp hòa nhập.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {aboutItems.map((item) => (
                <div key={item.label} className="rounded-3xl border border-blue-100 bg-blue-50/60 p-4">
                  <item.icon className="h-6 w-6 text-blue-700" aria-hidden="true" />
                  <p className="mt-3 font-black text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
