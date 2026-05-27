import { BookOpen, HandHeart, MessageCircle, Search, Sparkles, Users } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";

const sections = [
  { title: "Học bằng thị giác", icon: Search, text: "CHẠM giúp người dùng tra cứu từ vựng, cụm từ và chủ đề có thể mô tả qua ngôn ngữ ký hiệu." },
  { title: "Thẻ từ vựng trực quan", icon: BookOpen, text: "Mỗi thẻ có từ tiếng Việt, nghĩa, câu ví dụ, mô tả hình ảnh và phần giữ chỗ cho ký hiệu minh họa." },
  { title: "Quiz và bài học", icon: Sparkles, text: "Người học có thể ôn tập bằng câu hỏi nhanh và các mô-đun theo chủ đề." },
  { title: "Giao tiếp bao trùm", icon: MessageCircle, text: "Dự án khuyến khích giao tiếp rõ ràng, kiên nhẫn và tôn trọng lựa chọn của mỗi người." },
  { title: "Cộng đồng học tập", icon: Users, text: "CHẠM phù hợp cho demo lớp học, nhóm sinh viên và hoạt động nâng cao nhận thức." },
  { title: "Lưu ý chuyên môn", icon: HandHeart, text: "Dữ liệu ký hiệu trong bản demo là minh họa và cần được xác minh bởi nguồn chuyên môn." },
];

export default function AboutPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Giới thiệu</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">CHẠM là gì?</h1>
          <p className="mx-auto mt-5 max-w-3xl text-xl leading-9 text-slate-600">CHẠM là nền tảng web giúp người dùng học từ vựng ngôn ngữ ký hiệu Việt Nam thông qua thẻ trực quan, tìm kiếm, bài học và hoạt động quiz. Dự án cũng góp phần nâng cao nhận thức về giao tiếp hòa nhập.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <SectionCard key={section.title}>
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-3xl bg-blue-50 text-blue-600">
                <section.icon aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-black text-slate-950">{section.title}</h2>
              <p className="mt-3 leading-8 text-slate-600">{section.text}</p>
            </SectionCard>
          ))}
        </div>
      </div>
    </main>
  );
}
