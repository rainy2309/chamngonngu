import Link from "next/link";
import { ArrowRight, Eye, ExternalLink, HandHeart, HeartHandshake, Lightbulb, MessageCircle, MessageSquareText, Share2, Sparkles, Users, Video } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";

const fanpageUrl = "https://www.facebook.com/chamngonngu";

const articles = [
  { title: "Giao tiếp bằng sự tôn trọng", icon: MessageCircle, text: "Hãy hỏi người đối diện muốn trao đổi bằng cách nào: chữ viết, cử chỉ, khẩu hình, ký hiệu hay công cụ hỗ trợ." },
  { title: "Ánh sáng và tầm nhìn", icon: Eye, text: "Giữ khuôn mặt và bàn tay trong tầm nhìn rõ ràng để cuộc trò chuyện dễ theo dõi hơn." },
  { title: "Không vội vàng", icon: HeartHandshake, text: "Một nhịp giao tiếp chậm, rõ ý và kiên nhẫn giúp cả hai bên hiểu nhau tốt hơn." },
  { title: "Hình ảnh rất hữu ích", icon: Lightbulb, text: "Sơ đồ, biểu tượng, ghi chú và ví dụ ngắn có thể hỗ trợ việc học và trao đổi hằng ngày." },
  { title: "Học vài ký hiệu cơ bản", icon: HandHeart, text: "Xin chào, cảm ơn, xin lỗi, giúp và không hiểu là những từ có thể bắt đầu học trước." },
  { title: "Thử thách nhỏ", icon: Sparkles, text: "Thử giao tiếp 10 phút không dùng giọng nói để cảm nhận vai trò của hình ảnh và chữ viết." },
];

const contributionCards = [
  {
    title: "Góp video ký hiệu",
    description: "Gửi video minh họa cho những từ, cụm từ hoặc câu giao tiếp còn thiếu.",
    cta: "Đóng góp trong Từ điển",
    href: "/tu-dien",
    icon: Video,
    external: false,
  },
  {
    title: "Góp ý nghĩa và ví dụ",
    description: "Bổ sung cách dùng, ví dụ hoặc ghi chú để nội dung dễ hiểu hơn cho người mới học.",
    cta: "Tìm từ để góp ý",
    href: "/tu-dien",
    icon: MessageSquareText,
    external: false,
  },
  {
    title: "Chia sẻ dự án",
    description: "Theo dõi và chia sẻ fanpage để nhiều người biết đến CHẠM hơn.",
    cta: "Theo dõi fanpage",
    href: fanpageUrl,
    icon: Share2,
    external: true,
  },
];

export default function CommunityPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-8 text-slate-950 dark:from-slate-950 dark:to-slate-900 dark:text-slate-50 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 sm:gap-8">
        <section className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:p-7 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-black uppercase tracking-[0.16em] text-blue-500 dark:text-blue-300">Cộng đồng</p>
              <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">Hiểu để chạm gần hơn</h1>
              <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                Góc kiến thức CHẠM chia sẻ các gợi ý giao tiếp tích cực, cách đóng góp ký hiệu và hoạt động cộng đồng.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={fanpageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-700 px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-blue-500 dark:shadow-none dark:hover:bg-blue-400"
              >
                Theo dõi fanpage
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/tu-dien"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-blue-100 bg-white px-5 text-sm font-black text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-100 dark:hover:bg-slate-700"
              >
                Đóng góp ký hiệu
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-blue-100 bg-blue-700 p-5 text-white shadow-xl shadow-blue-100/60 dark:border-blue-500/30 dark:bg-blue-500/15 dark:shadow-none sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white">
              <Users className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Tham gia cộng đồng CHẠM</h2>
              <p className="mt-2 max-w-4xl text-sm font-semibold leading-7 text-blue-50 sm:text-base">
                Theo dõi fanpage của CHẠM để cập nhật từ vựng mới, video minh họa ký hiệu và các hoạt động lan tỏa giao tiếp thân thiện với người khiếm thính.
              </p>
            </div>
            <a
              href={fanpageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 dark:bg-slate-950 dark:text-blue-100 dark:hover:bg-slate-900"
            >
              Mở fanpage CHẠM
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-500 dark:text-blue-300">Đóng góp</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">Bạn có thể đóng góp gì?</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {contributionCards.map((card) => (
              <SectionCard key={card.title} className="grid gap-4 rounded-[1.5rem] p-5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-100">
                  <card.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">{card.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
                </div>
                {card.external ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-700 px-4 text-sm font-black text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-blue-500 dark:hover:bg-blue-400"
                  >
                    {card.cta}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    href={card.href}
                    className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-50 px-4 text-sm font-black text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-blue-500/15 dark:text-blue-100 dark:hover:bg-blue-500/25"
                  >
                    {card.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </SectionCard>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-500 dark:text-blue-300">Gợi ý giao tiếp</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">Giao tiếp thân thiện hơn mỗi ngày</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <SectionCard key={article.title} className="rounded-[1.5rem] p-5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-100">
                  <article.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white sm:text-xl">{article.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{article.text}</p>
              </SectionCard>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
