export default function AdminVideosPage() {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="mb-2 text-3xl font-black text-slate-950">Quản lý video</h1>
      <p className="mb-6 font-semibold text-slate-500">
        Upload và quản lý video ký hiệu cho từng từ.
      </p>
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
        <p className="font-bold text-slate-500">
          Tính năng đang phát triển. Hiện tại bạn có thể upload video qua trang
          Thêm từ mới hoặc Supabase Dashboard.
        </p>
      </div>
    </div>
  );
}
