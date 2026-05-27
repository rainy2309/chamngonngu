"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Info, LayoutDashboard, MessageCircle, Search, Users } from "lucide-react";
import { AuthNav } from "@/components/auth/AuthNav";
import { ChamLogo } from "@/components/common/ChamLogo";

const links = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/hoc-ky-hieu", label: "Học ký hiệu", icon: BookOpen },
  { href: "/tu-dien", label: "Từ điển", icon: Search },
  { href: "/giao-tiep", label: "Giao tiếp", icon: MessageCircle },
  { href: "/cong-dong", label: "Cộng đồng", icon: Users },
  { href: "/ve-du-an", label: "Về dự án", icon: Info },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-3 py-3">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-blue-100 bg-white/95 px-4 py-3 shadow-xl shadow-blue-100/60 backdrop-blur" aria-label="Điều hướng chính">
        <Link href="/" className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
          <ChamLogo />
          <span className="hidden sm:block">
            <span className="block text-2xl font-black leading-none text-blue-700">CHẠM</span>
            <span className="block text-xs font-bold text-slate-500">Kết nối bằng ngôn ngữ ký hiệu</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-black transition ${active ? "border-blue-600 text-blue-700" : "border-transparent text-slate-600 hover:text-blue-700"}`}>
                <link.icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <AuthNav />
        </div>
      </nav>

      <div className="mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto rounded-full border border-blue-100 bg-white px-3 py-2 shadow-lg shadow-blue-100/50 lg:hidden">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link key={link.href} href={link.href} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black ${active ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>
              {link.label}
            </Link>
          );
        })}
        <AuthNav />
      </div>
    </header>
  );
}
