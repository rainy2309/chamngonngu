import Link from "next/link";
import { ChamLogo } from "@/components/common/ChamLogo";

const footerGroups = [
  {
    title: "Học tập",
    links: [
      { label: "Bảng chữ cái", href: "/khoa-hoc/bang-chu-cai" },
      { label: "Từ vựng", href: "/khoa-hoc/tu-vung" },
      { label: "Luyện tập", href: "/khoa-hoc/luyen-tap" },
    ],
  },
  {
    title: "Khám phá",
    links: [
      { label: "Từ điển", href: "/tu-dien" },
      { label: "Cộng đồng", href: "/cong-dong" },
      { label: "Về dự án", href: "/ve-du-an" },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { label: "Hồ sơ", href: "/ho-so" },
      { label: "Đăng nhập", href: "/dang-nhap" },
      { label: "Đăng ký", href: "/dang-ky" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-blue-100 bg-white dark:border-slate-700 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 text-slate-600 dark:text-slate-300 sm:px-6 lg:grid-cols-[1.4fr_2fr] lg:px-8">
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <ChamLogo className="h-12 w-12 shadow-none sm:h-14 sm:w-14" />
            <div className="pt-0.5 sm:pt-1">
              <p className="text-xl font-black text-[#2EAFFF]">CHẠM</p>
              <p className="text-sm font-semibold">Kết nối bằng ngôn ngữ ký hiệu</p>
            </div>
          </div>
          <p className="max-w-3xl text-sm leading-7">
            CHẠM là dự án học tập giúp người mới bắt đầu làm quen với ngôn ngữ ký hiệu thông qua bảng chữ cái, từ điển, từ vựng và các bài luyện tập cơ bản. Trang web hướng đến việc tạo một không gian học dễ tiếp cận, thân thiện và góp phần kết nối cộng đồng người nghe với người điếc.
          </p>
          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <Link href="/chinh-sach-bao-mat" className="whitespace-nowrap text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
              Chính sách quyền riêng tư
            </Link>
            <Link href="/dieu-khoan-su-dung" className="whitespace-nowrap text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
              Điều khoản sử dụng
            </Link>
            <Link href="/gop-y" className="whitespace-nowrap text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
              Góp ý website
            </Link>
          </div>
        </div>

        <nav aria-label="Liên kết chân trang" className="grid gap-5 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title} className="grid content-start gap-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">{group.title}</h2>
              <ul className="grid gap-2 text-sm font-bold">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="whitespace-nowrap text-blue-700 transition hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
