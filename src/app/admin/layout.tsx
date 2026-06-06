import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      profile = prof;
    }
  } catch (err) {
    console.error("Admin layout auth check error:", err);
  }

  if (!user) {
    redirect("/dang-nhap");
  }

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-blue-100 bg-white p-4 lg:block">
        <div className="mb-6">
          <p className="text-sm font-black uppercase text-blue-600">
            Admin CHẠM
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Quản trị nội dung
          </p>
        </div>
        <nav className="grid gap-1">
          <AdminNavLink href="/admin/dashboard" label="Tổng quan" />
          <AdminNavLink href="/admin/dictionary" label="Từ vựng" />
          <AdminNavLink href="/admin/alphabet" label="Bảng chữ cái" />
          <AdminNavLink href="/admin/lessons" label="Bài học" />
          <AdminNavLink href="/admin/content" label="Nội dung tĩnh" />
          <AdminNavLink href="/admin/submissions" label="Duyệt đóng góp" />
          <AdminNavLink href="/admin/seed" label="Seed dữ liệu" />
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-1 overflow-x-auto border-t border-blue-100 bg-white p-2 lg:hidden">
        <AdminNavLink href="/admin/dashboard" label="Tổng quan" mobile />
        <AdminNavLink href="/admin/dictionary" label="Từ" mobile />
        <AdminNavLink href="/admin/alphabet" label="Chữ cái" mobile />
        <AdminNavLink href="/admin/lessons" label="Bài học" mobile />
        <AdminNavLink href="/admin/content" label="Content" mobile />
        <AdminNavLink href="/admin/submissions" label="Duyệt" mobile />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({
  href,
  label,
  mobile,
}: {
  href: string;
  label: string;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <a
        href={href}
        className="shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black text-slate-600 hover:bg-blue-50 hover:text-blue-700"
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={href}
      className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    >
      {label}
    </a>
  );
}
