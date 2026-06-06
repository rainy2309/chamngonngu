"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { VocabGrid } from "@/components/vocab/VocabGrid";
import { lessons, vocabularyData } from "@/data/vocabularyData";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lesson, setLesson] = useState<any | null>(null);
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      const localLesson = lessons.find((item) => item.id === id);
      if (localLesson) {
        setLesson(localLesson);
        const localWords = localLesson.wordIds
          .map((wordId) => vocabularyData.find((word) => word.id === wordId))
          .filter((word): word is any => Boolean(word));
        setWords(localWords);
      }
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data: lessonData }) => {
        if (lessonData) {
          const parsedLesson = {
            id: lessonData.id,
            topic: lessonData.topic,
            description: lessonData.description,
            difficulty: lessonData.difficulty,
            wordIds: lessonData.word_ids,
          };
          setLesson(parsedLesson);

          if (parsedLesson.wordIds && parsedLesson.wordIds.length > 0) {
            supabase
              .from("dictionary_words")
              .select("*")
              .in("id", parsedLesson.wordIds)
              .then(({ data: wordsData }) => {
                if (wordsData) {
                  const mappedWords = wordsData.map((row: any) => ({
                    id: row.id,
                    word: row.word,
                    meaning: row.meaning,
                    category: row.category,
                    exampleSentence: row.example_sentence,
                    imageDescription: row.description,
                    signVideoPlaceholder: "video",
                    videoUrl: row.video_url || undefined,
                    gifUrl: row.gif_url || undefined,
                    difficulty: row.difficulty,
                    relatedWords: row.related_words,
                  }));
                  setWords(mappedWords);
                }
                setLoading(false);
              });
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      });
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl flex-1 px-4 py-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <span className="ml-3 font-semibold text-slate-600">Đang tải bài học...</span>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="mx-auto max-w-7xl flex-1 px-4 py-10 text-center">
        <h1 className="text-3xl font-black">Không tìm thấy bài học</h1>
        <Button asChild className="mt-4 rounded-full"><Link href="/khoa-hoc">Quay lại khóa học</Link></Button>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Button asChild variant="secondary" className="mb-6 rounded-full"><Link href="/khoa-hoc"><ArrowLeft className="h-5 w-5" /> Quay lại</Link></Button>
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
