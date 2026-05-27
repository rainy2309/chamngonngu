import { FileText } from "lucide-react";

const items = [
  "CHẠM là nền tảng học ngôn ngữ ký hiệu phục vụ mục đích học tập và cộng đồng.",
  "Nội dung ký hiệu trong bản demo chỉ mang tính tham khảo và cần được xác minh bởi nguồn chuyên môn.",
  "Người dùng không được lạm dụng nền tảng để đăng nội dung sai lệch, xúc phạm hoặc gây hại.",
  "CHẠM có thể cập nhật nội dung và tính năng trong quá trình phát triển.",
  "Người dùng chịu trách nhiệm khi sử dụng thông tin học tập trong thực tế.",
];

export default function TermsPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/60 sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <FileText aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl">Điều khoản sử dụng</h1>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
          Khi sử dụng CHẠM, người dùng đồng ý với các điều khoản ngắn gọn dưới đây.
        </p>
        <div className="mt-6 grid gap-3">
          {items.map((item) => (
            <p key={item} className="rounded-2xl bg-blue-50/70 p-4 text-sm font-semibold leading-7 text-slate-700 sm:text-base">
              {item}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
