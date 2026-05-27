import { MessageCircle, PenLine, Smile, Users } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";

const situations = [
  { title: "Chào hỏi", icon: Smile, text: "Dùng ánh mắt, nụ cười, vẫy tay nhẹ và chữ viết ngắn khi cần." },
  { title: "Trong lớp học", icon: PenLine, text: "Nói từng ý rõ ràng, ghi từ khóa và dùng hình ảnh để hỗ trợ nội dung." },
  { title: "Làm việc nhóm", icon: Users, text: "Thống nhất cách trao đổi: ghi chú, ký hiệu đã biết, bảng nhóm hoặc tin nhắn." },
  { title: "Khi chưa hiểu", icon: MessageCircle, text: "Hỏi lại bằng thái độ bình tĩnh: Bạn muốn mình viết lại hay giải thích bằng hình ảnh?" },
];

export default function CommunicationPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Giao tiếp</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Gợi ý giao tiếp trực quan</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Một số tình huống đơn giản để thực hành giao tiếp tôn trọng với người điếc và khiếm thính.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {situations.map((item) => (
            <SectionCard key={item.title}>
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-3xl bg-blue-50 text-blue-600"><item.icon aria-hidden="true" /></div>
              <h2 className="text-2xl font-black text-slate-950">{item.title}</h2>
              <p className="mt-3 leading-8 text-slate-600">{item.text}</p>
            </SectionCard>
          ))}
        </div>
      </div>
    </main>
  );
}
