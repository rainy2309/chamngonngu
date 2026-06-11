import Link from "next/link";
import { BookOpen, ClipboardList, Layers, Search } from "lucide-react";
import { AuthNav } from "@/components/auth/AuthNav";

const quickLinks = [
  { href: "/tu-dien", label: "Tra từ", icon: Search },
  { href: "/khoa-hoc", label: "Bài học", icon: BookOpen },
  { href: "/khoa-hoc/luyen-tap", label: "Ôn tập", icon: Layers },
  { href: "/khoa-hoc/luyen-tap", label: "Làm quiz", icon: ClipboardList },
];

export function Sidebar() {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Đi nhanh</p>
      <div className="grid gap-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">
            <link.icon className="h-5 w-5" aria-hidden="true" />
            {link.label}
          </Link>
        ))}
      </div>
      <div className="mt-4 border-t border-slate-200 pt-4">
        <AuthNav />
      </div>
    </aside>
  );
}
