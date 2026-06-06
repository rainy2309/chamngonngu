"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { Flashcard } from "@/components/learning/Flashcard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/common/SectionCard";
import { vocabularyData, categories as localCategories } from "@/data/vocabularyData";
import { markWordForReview, markWordLearned } from "@/lib/progress";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import type { VocabularyItem } from "@/types/vocabulary";

export default function FlashcardsPage() {
  const [category, setCategory] = useState("Tất cả");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (!hasSupabaseEnv()) {
          throw new Error("Missing Supabase env");
        }
        const supabase = createClient();
        const { data, error } = await supabase
          .from("dictionary_words")
          .select("id, word, meaning, category, example_sentence, description, difficulty, related_words")
          .eq("status", "published");

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: VocabularyItem[] = data.map((item: any) => ({
            id: item.id,
            word: item.word,
            meaning: item.meaning,
            category: item.category,
            exampleSentence: item.example_sentence ?? "",
            imageDescription: item.description ?? "",
            signVideoPlaceholder: "",
            difficulty: item.difficulty ?? "easy",
            relatedWords: item.related_words ?? [],
          }));
          setVocabularyList(mapped);
          setCategoriesList([...new Set(mapped.map((w) => w.category))].sort());
        } else {
          throw new Error("No data in DB");
        }
      } catch (err) {
        console.warn("Could not load vocabulary from DB, checking dev fallback:", err);
        if (process.env.NODE_ENV === "development") {
          setVocabularyList(vocabularyData);
          setCategoriesList(localCategories);
        } else {
          setMessage("Không thể tải dữ liệu từ vựng từ cơ sở dữ liệu.");
        }
      } finally {
        setLoadingData(false);
      }
    }

    void loadData();
  }, []);

  const cards = useMemo(() => category === "Tất cả" ? vocabularyList : vocabularyList.filter((item) => item.category === category), [category, vocabularyList]);
  const current = cards[index % cards.length];
  const progress = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0;

  function nextCard() {
    setIndex((value) => (value + 1) % cards.length);
    setFlipped(false);
  }

  async function saveProgress(status: "learned" | "review") {
    setSaving(true);
    setMessage("");
    try {
      if (status === "learned") await markWordLearned(current.id);
      else await markWordForReview(current.id);
      nextCard();
    } catch {
      setMessage("Không thể lưu tiến độ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="font-semibold text-slate-500">Đang tải thẻ học từ vựng...</span>
        </div>
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-lg">
          <p className="text-xl font-bold text-slate-600">Không có thẻ học nào được tìm thấy.</p>
          {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Flashcard CHẠM</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Ôn từ bằng thẻ trực quan</h1>
          <p className="mt-4 text-lg text-slate-600">Lật thẻ, tự đánh giá và lưu từ đã biết hoặc cần ôn lại.</p>
        </div>
        <SectionCard>
          <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label>
              <span className="mb-2 block font-bold text-slate-800">Chọn chủ đề</span>
              <select value={category} onChange={(event) => { setCategory(event.target.value); setIndex(0); setFlipped(false); }} className="min-h-12 w-full rounded-xl border border-blue-100 bg-white px-4 text-base font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100">
                <option>Tất cả</option>
                {categoriesList.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <div className="self-end rounded-full bg-blue-50 px-5 py-3 font-black text-blue-700">Thẻ {index + 1} / {cards.length}</div>
          </div>
          {message ? <p className="mb-5 rounded-2xl bg-orange-50 p-4 font-semibold text-orange-900">{message}</p> : null}
          <Progress value={progress} className="mb-5" />
          <Flashcard item={current} flipped={flipped} onFlip={() => setFlipped((value) => !value)} />
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Button variant="secondary" onClick={() => setFlipped((value) => !value)} disabled={saving} className="rounded-full"><RotateCcw className="h-5 w-5" /> Lật thẻ</Button>
            <Button variant="success" onClick={() => void saveProgress("learned")} disabled={saving} className="rounded-full"><CheckCircle2 className="h-5 w-5" /> Biết rồi</Button>
            <Button variant="warning" onClick={() => void saveProgress("review")} disabled={saving} className="rounded-full">Cần ôn lại</Button>
            <Button onClick={nextCard} disabled={saving} className="rounded-full">Từ tiếp theo <ArrowRight className="h-5 w-5" /></Button>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
