import { ShieldCheck } from "lucide-react";

const items = [
  "CHẠM dùng Google Login để xác thực tài khoản.",
  "CHẠM chỉ lấy các thông tin cơ bản từ Google: email, tên hiển thị và ảnh đại diện nếu có.",
  "CHẠM không đọc Gmail, Google Drive, lịch, danh bạ hoặc dữ liệu riêng tư khác.",
  "CHẠM dùng dữ liệu này để đăng nhập, hiển thị hồ sơ học tập và lưu tiến độ học nếu người dùng sử dụng tính năng này.",
  "CHẠM không bán dữ liệu cá nhân cho bên thứ ba.",
  "Người dùng có thể đăng xuất bất cứ lúc nào.",
  "Người dùng có thể liên hệ với nhóm dự án để yêu cầu xóa dữ liệu tài khoản.",
];

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/60 sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <ShieldCheck aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl">Chính sách quyền riêng tư</h1>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
          Chính sách này mô tả cách CHẠM sử dụng thông tin khi người dùng đăng nhập và học tập trên nền tảng.
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
