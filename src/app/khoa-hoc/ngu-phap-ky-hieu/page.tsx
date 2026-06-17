import { BookOpen, Compass, Eye, Hand, Layers3, MapPinned, UsersRound } from "lucide-react";

const sections = [
  {
    title: "Ngôn ngữ ký hiệu không chỉ là “đánh vần”",
    text: "Ngôn ngữ ký hiệu có hệ thống biểu đạt riêng, không đơn giản là thay từng chữ bằng động tác tay.",
    icon: Hand,
  },
  {
    title: "Vai trò của nét mặt và chuyển động cơ thể",
    text: "Nét mặt, hướng nhìn, tốc độ và vị trí ký hiệu có thể hỗ trợ biểu đạt cảm xúc, câu hỏi hoặc mức độ nhấn mạnh.",
    icon: Eye,
  },
  {
    title: "Trật tự thông tin trong câu ký hiệu",
    text: "Một số cách biểu đạt ký hiệu có thể ưu tiên chủ đề hoặc ngữ cảnh trước rồi mới đến hành động hoặc thông tin chính. Cách dùng có thể khác nhau theo cộng đồng và vùng.",
    icon: Layers3,
  },
  {
    title: "Không gian ký hiệu",
    text: "Người ký hiệu có thể dùng không gian trước cơ thể để định vị người, vật hoặc hướng di chuyển trong câu chuyện.",
    icon: Compass,
  },
  {
    title: "Khác biệt vùng miền",
    text: "Một số ký hiệu có thể khác nhau giữa Hà Nội, Hải Phòng, TP.HCM hoặc cộng đồng sử dụng khác nhau.",
    icon: MapPinned,
  },
  {
    title: "Cần học từ nguồn chuyên môn",
    text: "Người học nên học thêm từ giáo viên, cộng đồng người điếc, tài liệu đã được kiểm chứng hoặc video minh họa đáng tin cậy.",
    icon: UsersRound,
  },
];

const sources = [
  "QIPEDC / Bộ GD&ĐT — danh mục ngôn ngữ ký hiệu",
  "ThaiPhong — Từ điển ngôn ngữ ký hiệu",
  "Hanoi Sign Language Talking Dictionary",
  "CED / cộng đồng giáo dục người điếc",
  "Tài liệu/giảng viên chuyên môn nhóm sẽ bổ sung sau",
];

export default function SignGrammarPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl">Ngữ pháp ký hiệu</h1>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-600 sm:text-lg sm:leading-8">Tìm hiểu một số đặc điểm cơ bản khi biểu đạt ý nghĩa bằng ngôn ngữ ký hiệu.</p>
        </div>

        <p className="mt-6 rounded-[1.5rem] bg-orange-50 p-5 font-semibold leading-7 text-orange-900">
          Nội dung ngữ pháp trong bản demo cần được nhóm đối chiếu lại với giáo viên, cộng đồng người điếc hoặc tài liệu chuyên môn.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <section.icon aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950">{section.title}</h2>
              <p className="mt-3 font-semibold leading-7 text-slate-600">{section.text}</p>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-700" aria-hidden="true" />
            <h2 className="text-2xl font-black text-slate-950">Nguồn tham khảo cần kiểm chứng</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {sources.map((source) => (
              <div key={source} className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 font-bold leading-7 text-slate-700">
                {source}
                <span className="ml-2 text-sm font-black text-blue-700">tham khảo</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
