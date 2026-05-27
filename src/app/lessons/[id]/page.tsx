"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { VocabGrid } from "@/components/vocab/VocabGrid";
import { lessons, vocabularyData } from "@/data/vocabularyData";

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lesson = lessons.find((item) => item.id === id);

  if (!lesson) {
    return (
      <main className="mx-auto max-w-7xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-black">Không tìm thấy bài học</h1>
        <Button asChild className="mt-4"><Link href="/lessons">Quay lại bài học</Link></Button>
      </main>
    );
  }

  const words = lesson.wordIds.map((wordId) => vocabularyData.find((word) => word.id === wordId)).filter((word) => Boolean(word));

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Button asChild variant="secondary" className="mb-6 rounded-full"><Link href="/lessons"><ArrowLeft className="h-5 w-5" /> Quay lại</Link></Button>
        <SectionCard className="mb-8">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Bài học CHẠM</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">{lesson.topic}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{lesson.description}</p>
        </SectionCard>
        <VocabGrid items={words as typeof vocabularyData} />
      </div>
    </main>
  );
}
