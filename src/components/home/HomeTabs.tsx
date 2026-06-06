"use client";

import Link from "next/link";
import { BookOpen, Bookmark, ClipboardCheck, Grid3X3, Layers, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { VocabGrid } from "@/components/vocab/VocabGrid";
import { categories, lessons, vocabularyData } from "@/data/vocabularyData";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

const tabs = [
  { id: "vocab", label: "Từ vựng", icon: Layers },
  { id: "board", label: "Chủ đề", icon: Grid3X3 },
  { id: "practice", label: "Luyện tập", icon: ClipboardCheck },
  { id: "lessons", label: "Khóa học", icon: BookOpen },
  { id: "favorites", label: "Yêu thích", icon: Bookmark },
];

export function HomeTabs() {
  const [activeTab, setActiveTab] = useState("vocab");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dbLessons, setDbLessons] = useState<any[]>(lessons);
  const [previewWords, setPreviewWords] = useState<any[]>([]);
  const [favoriteWords, setFavoriteWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(Boolean(data.user)));

    async function loadData() {
      try {
        // 1. Fetch preview words from DB
        const { data: wordsData } = await supabase
          .from("dictionary_words")
          .select("*")
          .eq("status", "published")
          .limit(4);

        if (wordsData && wordsData.length > 0) {
          setPreviewWords(wordsData.map((row: any) => ({
            id: row.id,
            word: row.word,
            meaning: row.meaning,
            category: row.category,
            exampleSentence: row.example_sentence ?? "",
            imageDescription: row.description ?? "",
            videoUrl: row.video_url || undefined,
            gifUrl: row.gif_url || undefined,
            difficulty: row.difficulty,
            relatedWords: row.related_words || [],
          })));
        } else if (process.env.NODE_ENV === "development") {
          console.warn("DB empty, falling back to static vocabularyData in DEV mode");
          setPreviewWords(vocabularyData.slice(0, 4));
        }

        // 2. Fetch favorites from DB based on local storage IDs
        const localFavs = JSON.parse(window.localStorage.getItem("cham_favorite_signs") ?? "[]") as string[];
        if (localFavs.length > 0) {
          const { data: favsData } = await supabase
            .from("dictionary_words")
            .select("*")
            .in("id", localFavs);

          if (favsData) {
            setFavoriteWords(favsData.map((row: any) => ({
              id: row.id,
              word: row.word,
              meaning: row.meaning,
              category: row.category,
              exampleSentence: row.example_sentence ?? "",
              imageDescription: row.description ?? "",
              videoUrl: row.video_url || undefined,
              gifUrl: row.gif_url || undefined,
              difficulty: row.difficulty,
              relatedWords: row.related_words || [],
            })));
          }
        }

        // 3. Fetch lessons
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*");

        if (lessonsData && lessonsData.length > 0) {
          setDbLessons(lessonsData.map((row: any) => ({
            id: row.id,
            topic: row.topic,
            description: row.description,
            difficulty: row.difficulty,
            wordIds: row.word_ids,
          })));
        }
      } catch (err) {
        console.error("Error loading homepage data:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  return (
    <SectionCard className="mx-auto mt-8 max-w-6xl sm:mt-12">
      <div className="mb-5 flex gap-2 overflow-x-auto border-b border-blue-100 pb-1 sm:mb-7 sm:gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:text-base ${
              activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-600"
            }`}
          >
            <tab.icon className="h-5 w-5" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {activeTab === "vocab" ? (
            <div className="space-y-6">
              {previewWords.length > 0 ? (
                <VocabGrid items={previewWords} compact />
              ) : (
                <p className="text-center font-semibold text-slate-500 py-10">Chưa có từ vựng nào.</p>
              )}
              <div className="text-center">
                <Button asChild className="w-full rounded-full px-7 sm:w-auto">
                  <Link href="/tu-dien">Xem tất cả từ vựng</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {activeTab === "board" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((category) => (
                <Link key={category} href={`/tu-dien?category=${encodeURIComponent(category)}`} className="rounded-3xl bg-blue-50 p-5 font-black text-blue-900 shadow-sm transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:p-6">
                  {category}
                  <p className="mt-2 text-sm font-semibold text-blue-700">Khám phá nhóm từ vựng</p>
                </Link>
              ))}
            </div>
          ) : null}

          {activeTab === "practice" ? (
            <div className="grid gap-4 md:grid-cols-3">
              {["Chọn nghĩa đúng", "Nhận diện qua minh họa", "Ghép với chủ đề"].map((title) => (
                <div key={title} className="rounded-3xl bg-blue-50 p-5 sm:p-6">
                  <ClipboardCheck className="mb-4 h-8 w-8 text-blue-600" aria-hidden="true" />
                  <h3 className="text-lg font-black text-slate-950 sm:text-xl">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Luyện tập nhanh với dữ liệu minh họa.</p>
                </div>
              ))}
              <div className="md:col-span-3">
                <Button asChild className="w-full rounded-full px-7 sm:w-auto">
                  <Link href="/quiz">Bắt đầu luyện tập</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {activeTab === "lessons" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {dbLessons.slice(0, 4).map((lesson) => (
                <div key={lesson.id} className="rounded-3xl border border-blue-100 p-5">
                  <h3 className="text-lg font-black text-slate-950 sm:text-xl">{lesson.topic}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">{lesson.description}</p>
                </div>
              ))}
              <div className="md:col-span-2">
                <Button asChild className="w-full rounded-full px-7 sm:w-auto">
                  <Link href="/khoa-hoc">Xem khóa học</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {activeTab === "favorites" ? (
            <div className="space-y-6">
              {favoriteWords.length > 0 ? (
                <VocabGrid items={favoriteWords} compact />
              ) : (
                <div className="rounded-3xl bg-blue-50 p-6 text-center sm:p-8">
                  <Bookmark className="mx-auto mb-4 h-10 w-10 text-blue-600" aria-hidden="true" />
                  <p className="text-base font-bold text-blue-900 sm:text-lg">
                    {isLoggedIn ? "Bạn chưa lưu từ yêu thích nào." : "Đăng nhập để lưu từ yêu thích."}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </>
      )}
    </SectionCard>
  );
}
