"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { Flashcard } from "@/components/learning/Flashcard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/common/SectionCard";
import { categories, vocabularyData } from "@/data/vocabularyData";
import { markWordForReview, markWordLearned } from "@/lib/progress";

export default function FlashcardsPage() {
  const [category, setCategory] = useState("Tất cả");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const cards = useMemo(() => category === "Tất cả" ? vocabularyData : vocabularyData.filter((item) => item.category === category), [category]);
  const current = cards[index % cards.length];
  const progress = ((index + 1) / cards.length) * 100;

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
                {categories.map((item) => <option key={item}>{item}</option>)}
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
