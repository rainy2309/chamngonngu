import { Eye, HandHeart, HeartHandshake, Lightbulb, MessageCircle, Sparkles } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";

const articles = [
  { title: "Giao tiếp bằng sự tôn trọng", icon: MessageCircle, text: "Hãy hỏi người đối diện muốn trao đổi bằng cách nào: chữ viết, cử chỉ, khẩu hình, ký hiệu hay công cụ hỗ trợ." },
  { title: "Ánh sáng và tầm nhìn", icon: Eye, text: "Giữ khuôn mặt và bàn tay trong tầm nhìn rõ ràng để cuộc trò chuyện dễ theo dõi hơn." },
  { title: "Không vội vàng", icon: HeartHandshake, text: "Một nhịp giao tiếp chậm, rõ ý và kiên nhẫn giúp cả hai bên hiểu nhau tốt hơn." },
  { title: "Hình ảnh rất hữu ích", icon: Lightbulb, text: "Sơ đồ, biểu tượng, ghi chú và ví dụ ngắn có thể hỗ trợ việc học và trao đổi hằng ngày." },
  { title: "Học vài ký hiệu cơ bản", icon: HandHeart, text: "Xin chào, cảm ơn, xin lỗi, giúp và không hiểu là những từ có thể bắt đầu học trước." },
  { title: "Thử thách nhỏ", icon: Sparkles, text: "Thử giao tiếp 10 phút không dùng giọng nói để cảm nhận vai trò của hình ảnh và chữ viết." },
];

export default function CommunityPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Cộng đồng</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Hiểu để chạm gần hơn</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Góc kiến thức CHẠM chia sẻ các gợi ý giao tiếp tích cực với cộng đồng người điếc và khiếm thính.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <SectionCard key={article.title}>
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-3xl bg-blue-50 text-blue-600">
                <article.icon aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-black text-slate-950">{article.title}</h2>
              <p className="mt-3 leading-8 text-slate-600">{article.text}</p>
            </SectionCard>
          ))}
        </div>
      </div>
    </main>
  );
}
