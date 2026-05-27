"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { SectionCard } from "@/components/common/SectionCard";
import { VocabGrid } from "@/components/vocab/VocabGrid";
import { categories, vocabularyData } from "@/data/vocabularyData";

export default function VocabPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");

  useEffect(() => {
    const initialCategory = new URLSearchParams(window.location.search).get("category");
    if (initialCategory) setCategory(initialCategory);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return vocabularyData.filter((item) => {
      const matchesCategory = category === "Tất cả" || item.category === category;
      const matchesQuery = !normalized || [item.word, item.meaning, item.category, item.exampleSentence].some((value) => value.toLowerCase().includes(normalized));
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Vocab</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Kho từ vựng CHẠM</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Khám phá các thẻ từ vựng theo chủ đề, lưu từ yêu thích và ôn lại bằng quiz.</p>
        </div>
        <SectionCard>
          <SearchBar value={query} onChange={setQuery} />
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {["Tất cả", ...categories].map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${category === item ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="mt-7">
            <VocabGrid items={filtered} />
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
