"use client";

import { useMemo, useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { SectionCard } from "@/components/common/SectionCard";
import { VocabGrid } from "@/components/vocab/VocabGrid";
import { categories, vocabularyData } from "@/data/vocabularyData";

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");

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
        <div className="mb-8 text-center">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Từ điển CHẠM</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Tra cứu ký hiệu minh họa</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">Tìm từ, nghĩa, ví dụ và chủ đề có thể học qua thẻ trực quan. GIF/video ký hiệu chỉ là placeholder trong bản demo.</p>
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
          <p className="my-6 font-bold text-slate-600">Tìm thấy {filtered.length} nội dung</p>
          <VocabGrid items={filtered} />
        </SectionCard>
      </div>
    </main>
  );
}
