"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { Progress } from "@/components/ui/progress";
import { lessons } from "@/data/vocabularyData";
import { difficultyLabel } from "@/lib/utils";

export default function LessonsPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Bài học</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Lộ trình học ký hiệu</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Mỗi mô-đun kết hợp từ vựng, hình minh họa, ví dụ và hoạt động ôn tập ngắn.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson, index) => (
            <SectionCard key={lesson.id} className="flex h-full flex-col">
              <div className="mb-5 flex items-center justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-3xl bg-blue-50 text-blue-600">
                  <BookOpen aria-hidden="true" />
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">{difficultyLabel(lesson.difficulty)}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950">{lesson.topic}</h2>
              <p className="mt-3 flex-1 leading-7 text-slate-600">{lesson.description}</p>
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                  <span>{lesson.wordIds.length} từ vựng</span>
                  <span className="inline-flex items-center gap-1"><Signal className="h-4 w-4" /> {Math.min(100, (index + 1) * 12)}%</span>
                </div>
                <Progress value={Math.min(100, (index + 1) * 12)} />
              </div>
              <Button asChild className="mt-6 rounded-full">
                <Link href={`/lessons/${lesson.id}`}>Xem bài học <ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </SectionCard>
          ))}
        </div>
      </div>
    </main>
  );
}
