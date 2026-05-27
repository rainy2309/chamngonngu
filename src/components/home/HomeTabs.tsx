"use client";

import Link from "next/link";
import { BookOpen, Bookmark, ClipboardCheck, Grid3X3, Layers } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { VocabGrid } from "@/components/vocab/VocabGrid";
import { categories, lessons, vocabularyData } from "@/data/vocabularyData";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

const tabs = [
  { id: "vocab", label: "Vocab", icon: Layers },
  { id: "board", label: "Bảng", icon: Grid3X3 },
  { id: "quiz", label: "Quiz", icon: ClipboardCheck },
  { id: "lessons", label: "Bài học", icon: BookOpen },
  { id: "favorites", label: "Yêu thích", icon: Bookmark },
];

export function HomeTabs() {
  const [activeTab, setActiveTab] = useState("vocab");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const previewWords = useMemo(() => ["xin-chao", "an", "yeu-thuong", "hom-nay"].map((id) => vocabularyData.find((item) => item.id === id)).filter(Boolean), []);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(Boolean(data.user)));
  }, []);

  return (
    <SectionCard className="mx-auto mt-12 max-w-6xl">
      <div className="mb-7 flex gap-3 overflow-x-auto border-b border-blue-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-base font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-600"}`}
          >
            <tab.icon className="h-5 w-5" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "vocab" ? (
        <div className="space-y-6">
          <VocabGrid items={previewWords as typeof vocabularyData} compact />
          <div className="text-center"><Button asChild className="rounded-full px-7"><Link href="/vocab">Xem tất cả từ vựng</Link></Button></div>
        </div>
      ) : null}

      {activeTab === "board" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <Link key={category} href={`/vocab?category=${encodeURIComponent(category)}`} className="rounded-3xl bg-blue-50 p-6 font-black text-blue-900 shadow-sm transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
              {category}
              <p className="mt-2 text-sm font-semibold text-blue-700">Khám phá nhóm từ vựng</p>
            </Link>
          ))}
        </div>
      ) : null}

      {activeTab === "quiz" ? (
        <div className="grid gap-5 md:grid-cols-3">
          {["Chọn nghĩa đúng", "Nhận diện qua minh họa", "Ghép với chủ đề"].map((title) => (
            <div key={title} className="rounded-3xl bg-blue-50 p-6">
              <ClipboardCheck className="mb-4 h-8 w-8 text-blue-600" aria-hidden="true" />
              <h3 className="text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-slate-600">Luyện tập nhanh với dữ liệu minh họa.</p>
            </div>
          ))}
          <div className="md:col-span-3"><Button asChild className="rounded-full px-7"><Link href="/quiz">Bắt đầu Quiz</Link></Button></div>
        </div>
      ) : null}

      {activeTab === "lessons" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.slice(0, 4).map((lesson) => (
            <div key={lesson.id} className="rounded-3xl border border-blue-100 p-5">
              <h3 className="text-xl font-black text-slate-950">{lesson.topic}</h3>
              <p className="mt-2 leading-7 text-slate-600">{lesson.description}</p>
            </div>
          ))}
          <div className="md:col-span-2"><Button asChild className="rounded-full px-7"><Link href="/lessons">Xem bài học</Link></Button></div>
        </div>
      ) : null}

      {activeTab === "favorites" ? (
        <div className="rounded-3xl bg-blue-50 p-8 text-center">
          <Bookmark className="mx-auto mb-4 h-10 w-10 text-blue-600" aria-hidden="true" />
          <p className="text-lg font-bold text-blue-900">{isLoggedIn ? "Các từ đã lưu sẽ được hiển thị tại đây trong bản mở rộng." : "Đăng nhập để lưu từ yêu thích."}</p>
        </div>
      ) : null}
    </SectionCard>
  );
}
