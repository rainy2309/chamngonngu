import Link from "next/link";
import { BookOpen, Feather, Layers3, MessageSquareText, Puzzle, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const courses = [
  {
    title: "Ký hiệu bảng chữ cái",
    description: "Làm quen với ký hiệu chữ cái tiếng Việt và cách biểu đạt từng chữ bằng hình ảnh minh họa.",
    button: "Bắt đầu",
    href: "/khoa-hoc/bang-chu-cai",
    icon: Feather,
  },
  {
    title: "Từ vựng",
    description: "Học các từ và câu giao tiếp cơ bản theo 10 chủ đề thường dùng trong đời sống.",
    button: "Học từ vựng",
    href: "/khoa-hoc/tu-vung",
    icon: Tags,
  },
  {
    title: "Ghép từ",
    description: "Học cách kết hợp chữ cái và dấu tiếng Việt để tạo thành từ có nghĩa.",
    button: "Luyện ghép từ",
    href: "/khoa-hoc/ghep-tu",
    icon: Puzzle,
  },
  {
    title: "Ghép câu",
    description: "Luyện kết hợp các từ thành câu giao tiếp phù hợp với tình huống đời sống.",
    button: "Luyện ghép câu",
    href: "/khoa-hoc/ghep-cau",
    icon: MessageSquareText,
  },
  {
    title: "Ngữ pháp ký hiệu",
    description: "Tìm hiểu cách biểu đạt ý nghĩa, trật tự thông tin và đặc điểm ngữ pháp trong ngôn ngữ ký hiệu.",
    button: "Xem ngữ pháp",
    href: "/khoa-hoc/ngu-phap",
    icon: Layers3,
  },
];

export default function CoursesPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-800">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Lộ trình học CHẠM
          </div>
          <h1 className="text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl">Khóa học</h1>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-600 sm:text-lg sm:leading-8">Học ký hiệu theo từng cấp độ: từ bảng chữ cái, ghép từ, ghép câu đến ngữ pháp ký hiệu.</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.title} className="rounded-[2rem] border-blue-100 bg-white shadow-xl shadow-blue-100/50">
              <CardContent className="grid gap-5 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <course.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{course.title}</h2>
                  <p className="mt-2 min-h-16 font-semibold leading-7 text-slate-600">{course.description}</p>
                </div>
                <Button asChild className="w-full rounded-full sm:w-fit">
                  <Link href={course.href}>{course.button}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
