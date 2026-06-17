import Link from "next/link";
import { ChamLogo } from "@/components/common/ChamLogo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-blue-100 bg-white dark:border-slate-700 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 text-slate-600 dark:text-slate-300 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <ChamLogo className="h-12 w-12 shadow-none sm:h-14 sm:w-14" />
          <div className="pt-0.5 sm:pt-1">
            <p className="text-xl font-black text-[#2EAFFF]">CHẠM</p>
            <p className="text-sm font-semibold">Kết nối bằng ngôn ngữ ký hiệu</p>
          </div>
        </div>
        <p className="max-w-3xl text-sm leading-7">
          CHẠM là dự án học tập giúp người mới bắt đầu làm quen với ngôn ngữ ký hiệu qua bảng chữ cái, từ điển, từ vựng và các bài luyện tập cơ bản. Trang web hướng đến việc tạo một không gian học dễ tiếp cận, thân thiện và góp phần kết nối cộng đồng người nghe với người điếc.
        </p>
        <div className="flex flex-wrap gap-4 text-sm font-bold">
          <Link href="/tu-dien" className="whitespace-nowrap text-blue-700 hover:text-blue-900">
            Từ điển
          </Link>
          <Link href="/khoa-hoc" className="whitespace-nowrap text-blue-700 hover:text-blue-900">
            Khóa học
          </Link>
          <Link href="/khoa-hoc/ghep-cau" className="whitespace-nowrap text-blue-700 hover:text-blue-900">
            Ghép câu
          </Link>
          <Link href="/#ve-cham" className="whitespace-nowrap text-blue-700 hover:text-blue-900">
            Về CHẠM
          </Link>
          <Link href="/chinh-sach-bao-mat" className="whitespace-nowrap text-blue-700 hover:text-blue-900">
            Chính sách quyền riêng tư
          </Link>
          <Link href="/dieu-khoan-su-dung" className="whitespace-nowrap text-blue-700 hover:text-blue-900">
            Điều khoản sử dụng
          </Link>
        </div>
      </div>
    </footer>
  );
}
