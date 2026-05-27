import Link from "next/link";
import { ChamLogo } from "@/components/common/ChamLogo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-blue-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 text-slate-600 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <ChamLogo className="h-10 w-10 shadow-none" />
          <div>
            <p className="text-xl font-black text-blue-700">CHẠM</p>
            <p className="text-sm font-semibold">Kết nối bằng ngôn ngữ ký hiệu</p>
          </div>
        </div>
        <p className="max-w-3xl text-sm leading-7">
          CHẠM ưu tiên học tập bằng hình ảnh, chữ viết rõ ràng và nội dung dễ tiếp cận. GIF/video ký hiệu trong bản demo là placeholder và cần được xác minh bởi nguồn chuyên môn.
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
