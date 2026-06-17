"use client";

import { CheckCircle2, Hand, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { readLearningState, saveLearningItemForCurrentUser } from "@/lib/authLearning";
import type { VocabularyItem } from "@/types/vocabulary";

export function VocabCard({ item, compact = false }: { item: VocabularyItem; compact?: boolean }) {
  const [learned, setLearned] = useState(false);

  useEffect(() => {
    async function loadLearningState() {
      const learnedState = await readLearningState("learned");
      setLearned(learnedState.ids.includes(item.id));
    }

    void loadLearningState();
  }, [item.id]);
  async function markLearned() {
    await saveLearningItemForCurrentUser("learned", {
      id: item.id,
      label: item.word,
      itemType: "vocabulary",
      category: item.category,
      href: `/tu-dien?q=${encodeURIComponent(item.word)}`,
    });
    setLearned(true);
  }

  return (
    <article className="group rounded-[1.75rem] border border-blue-50 bg-white p-4 shadow-lg shadow-blue-100/50 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-blue-600">
          <Hand className="h-8 w-8" aria-hidden="true" />
        </div>
      </div>
      <div className="space-y-2">
        <Badge className="bg-blue-50 text-blue-700 ring-blue-100">{item.category}</Badge>
        <h3 className="text-2xl font-black text-slate-950">{item.word}</h3>
        <p className="leading-7 text-slate-600">{compact ? item.imageDescription : item.meaning}</p>
      </div>
      <div className="mt-5 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4 text-blue-900">
        <div className="mb-2 flex items-center gap-2 font-bold">
          <PlayCircle className="h-5 w-5" aria-hidden="true" />
          Ký hiệu minh họa
        </div>
        <p className="text-sm leading-6">{item.signVideoPlaceholder}</p>
      </div>
      {!compact ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" className="rounded-full">Xem ký hiệu</Button>
          <Button variant={learned ? "success" : "outline"} className="rounded-full" onClick={markLearned}>
            <CheckCircle2 className="h-5 w-5" />
            {learned ? "Đã học" : "Đã học"}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
