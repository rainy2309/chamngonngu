"use client";

import { useMemo, useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { VocabGrid } from "@/components/vocab/VocabGrid";
import { lessons, vocabularyData } from "@/data/vocabularyData";

export function SearchSection() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const results = useMemo(() => {
    const normalized = submittedQuery.trim().toLowerCase();
    if (!normalized) return [];

    return vocabularyData.filter((item) => {
      const lessonTitle = lessons.find((lesson) => lesson.wordIds.includes(item.id))?.topic ?? "";
      return [item.word, item.meaning, item.category, item.exampleSentence, lessonTitle].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [submittedQuery]);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <SearchBar value={query} onChange={setQuery} onSubmit={() => setSubmittedQuery(query)} />
      {submittedQuery ? (
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-black text-slate-950">Kết quả tìm kiếm</h2>
          <VocabGrid items={results} compact />
        </div>
      ) : null}
    </section>
  );
}
