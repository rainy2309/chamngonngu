"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, ChevronDown, Home, Menu, Search, Users, X } from "lucide-react";
import { AuthNav } from "@/components/auth/AuthNav";
import { ChamLogo } from "@/components/common/ChamLogo";

const mainLinks = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/tu-dien", label: "Từ điển", icon: Search },
  { href: "/cong-dong", label: "Cộng đồng", icon: Users },
];

const courseLinks = [
  { href: "/khoa-hoc/bang-chu-cai", label: "Ký hiệu bảng chữ cái" },
  { href: "/khoa-hoc/tu-vung", label: "Từ vựng" },
  { href: "/khoa-hoc/luyen-tap", label: "Luyện tập" },
  { href: "/khoa-hoc/ngu-phap", label: "Ngữ pháp" },
];

function DesktopCourseDropdown() {
  const pathname = usePathname();
  const active = pathname === "/khoa-hoc" || pathname.startsWith("/khoa-hoc/");

  return (
    <div className="group relative shrink-0">
      <Link
        href="/khoa-hoc"
        className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-black transition ${
          active ? "border-blue-600 text-blue-700 dark:border-blue-300 dark:text-blue-200" : "border-transparent text-slate-600 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-200"
        }`}
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Khóa học
        <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" aria-hidden="true" />
      </Link>
      <div className="invisible absolute left-0 top-full z-50 min-w-72 translate-y-2 rounded-3xl border border-blue-100 bg-white p-2 opacity-0 shadow-2xl shadow-blue-100/70 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        {courseLinks.map((link) => (
          <Link key={link.href} href={link.href} className="block whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-blue-200">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 px-3 py-3">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[1.75rem] border border-blue-100 bg-white/95 px-4 py-3 shadow-xl shadow-blue-100/60 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-none lg:rounded-full"
        aria-label="Điều hướng chính"
      >
        <Link href="/" onClick={closeMenu} className="flex min-w-0 shrink-0 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
          <ChamLogo className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
          <span className="block min-w-0 pt-0.5 sm:pt-1">
            <span className="block whitespace-nowrap text-xl font-black leading-none text-[#2EAFFF] sm:text-2xl">CHẠM</span>
            <span className="hidden whitespace-nowrap text-xs font-bold text-slate-500 sm:block">Kết nối bằng ngôn ngữ ký hiệu</span>
          </span>
        </Link>

        <div className="hidden min-w-0 items-center gap-1 lg:flex">
          {mainLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-black transition ${
                isActive(link.href) ? "border-blue-600 text-blue-700 dark:border-blue-300 dark:text-blue-200" : "border-transparent text-slate-600 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-200"
              }`}
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
          <DesktopCourseDropdown />
          {mainLinks.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-black transition ${
                isActive(link.href) ? "border-blue-600 text-blue-700 dark:border-blue-300 dark:text-blue-200" : "border-transparent text-slate-600 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-200"
              }`}
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden shrink-0 lg:block">
          <AuthNav />
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-800 dark:text-blue-200 lg:hidden"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {open ? (
        <div className="mx-auto mt-3 max-w-7xl rounded-[1.75rem] border border-blue-100 bg-white p-3 shadow-2xl shadow-blue-100/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none lg:hidden">
          <div className="grid gap-1">
            {mainLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`flex min-h-12 items-center gap-3 whitespace-nowrap rounded-2xl px-4 text-sm font-black ${
                  isActive(link.href) ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-800 dark:bg-slate-800 dark:text-blue-100"
                }`}
              >
                <link.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {link.label}
              </Link>
            ))}

            <div className="rounded-2xl bg-blue-50 p-2 dark:bg-slate-800">
              <Link
                href="/khoa-hoc"
                onClick={closeMenu}
                className={`flex min-h-12 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-sm font-black ${
                  pathname.startsWith("/khoa-hoc") ? "bg-blue-600 text-white" : "text-blue-800 dark:text-blue-100"
                }`}
              >
                <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                Khóa học
              </Link>
              <div className="mt-1 grid gap-1 pl-4">
                {courseLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={closeMenu} className="min-h-11 whitespace-nowrap rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-white hover:text-blue-700 dark:text-slate-100 dark:hover:bg-slate-900 dark:hover:text-blue-200">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/cong-dong"
              onClick={closeMenu}
              className={`flex min-h-12 items-center gap-3 whitespace-nowrap rounded-2xl px-4 text-sm font-black ${
                pathname.startsWith("/cong-dong") ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-800 dark:bg-slate-800 dark:text-blue-100"
              }`}
            >
              <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
              Cộng đồng
            </Link>
          </div>

          <div className="mt-3 border-t border-blue-100 pt-3 dark:border-slate-700">
            <AuthNav />
          </div>
        </div>
      ) : null}
    </header>
  );
}
