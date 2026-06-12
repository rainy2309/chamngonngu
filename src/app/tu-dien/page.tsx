"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Bookmark, CheckCircle2, HelpCircle, Info, Loader2, Search, Sparkles, X } from "lucide-react";
import { AIExplanation } from "@/components/dictionary/AIExplanation";
import { CommunityVideos } from "@/components/dictionary/CommunityVideos";
import { WordComments } from "@/components/dictionary/WordComments";
import { WordSuggestionModal } from "@/components/dictionary/WordSuggestionModal";
import { SectionCard } from "@/components/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signCategories, signDictionaryData, type SignDictionaryItem } from "@/data/signDictionaryData";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getVietnameseFirstLetter, groupDictionaryByLetter, normalizeVietnameseText, vietnameseAlphabet } from "@/lib/vietnameseText";

const favoriteKey = "cham_favorite_signs";
const learnedKey = "cham_learned_signs";

const difficultyLabels = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

const regionLabels = {
  HN: "Hà Nội",
  HP: "Hải Phòng",
  HCM: "TP.HCM",
  "Toàn quốc": "Toàn quốc",
  "Chưa xác định": "Chưa xác định",
};

type LocalLearningRecord = {
  id: string;
  itemId: string;
  label: string;
  word: string;
  category: string;
  itemType: "dictionary";
  href: string;
  savedAt: string;
  updatedAt: string;
};

type LocalLearningEntry = string | Partial<LocalLearningRecord>;

function getLocalEntryId(item: unknown) {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    return String(record.id ?? record.itemId ?? record.word_key ?? record.wordKey ?? "");
  }
  return "";
}

function readLocalEntries(key: string): LocalLearningEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as LocalLearningEntry[]) : [];
  } catch {
    return [];
  }
}

function readLocalArray(key: string) {
  return readLocalEntries(key).map(getLocalEntryId).filter(Boolean);
}

function makeDictionaryLearningRecord(item: SignDictionaryItem): LocalLearningRecord {
  const now = new Date().toISOString();
  return {
    id: item.id,
    itemId: item.id,
    label: item.word,
    word: item.word,
    category: item.category,
    itemType: "dictionary",
    href: `/tu-dien?q=${encodeURIComponent(item.word)}`,
    savedAt: now,
    updatedAt: now,
  };
}

function toggleLocalItem(key: string, item: SignDictionaryItem) {
  const current = readLocalEntries(key);
  const currentIds = current.map(getLocalEntryId).filter(Boolean);
  const nextEntries = currentIds.includes(item.id)
    ? current.filter((entry) => getLocalEntryId(entry) !== item.id)
    : [makeDictionaryLearningRecord(item), ...current.filter((entry) => getLocalEntryId(entry) !== item.id)];
  window.localStorage.setItem(key, JSON.stringify(nextEntries));
  return nextEntries.map(getLocalEntryId).filter(Boolean);
}

function slugifyTopic(value: string) {
  return normalizeVietnameseText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeComparableText(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function tokenizeSearchText(value: string) {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function phraseSegmentMatch(text: string, query: string) {
  if (!text || !query) return false;
  if (text === query) return true;
  if (text.startsWith(`${query} `)) return true;
  if (text.endsWith(` ${query}`)) return true;
  return text.includes(` ${query} `);
}

function wordOrPhraseMatch(text: string, query: string) {
  if (!text || !query) return false;
  if (phraseSegmentMatch(text, query)) return true;
  return tokenizeSearchText(text).includes(query);
}

function getSearchScore(item: SignDictionaryItem, rawQuery: string) {
  const originalQuery = normalizeComparableText(rawQuery);
  const normalizedQuery = normalizeVietnameseText(rawQuery);
  if (!originalQuery || !normalizedQuery) return 1;

  const originalWord = normalizeComparableText(item.word);
  const normalizedWord = normalizeVietnameseText(item.word);
  const normalizedStoredWord = normalizeVietnameseText(item.normalizedWord);
  const normalizedWordCandidates = Array.from(new Set([normalizedWord, normalizedStoredWord].filter(Boolean)));
  const isShortQuery = normalizedQuery.length <= 2;

  if (originalWord === originalQuery) return 100;
  if (originalWord.startsWith(`${originalQuery} `) || originalWord.startsWith(`${originalQuery}-`)) return 90;
  if (wordOrPhraseMatch(originalWord, originalQuery)) return 80;

  if (normalizedWordCandidates.some((word) => word === normalizedQuery)) return 70;
  if (normalizedWordCandidates.some((word) => word.startsWith(`${normalizedQuery} `) || word.startsWith(`${normalizedQuery}-`))) return 60;
  if (normalizedWordCandidates.some((word) => wordOrPhraseMatch(word, normalizedQuery))) return 50;

  if (!isShortQuery && [item.meaning, item.simpleExplanation, item.exampleSentence, item.description, ...item.relatedWords].some((field) => normalizeVietnameseText(field ?? "").includes(normalizedQuery))) {
    return 30;
  }

  if (normalizedQuery.length >= 4 && normalizeVietnameseText(item.category).includes(normalizedQuery)) {
    return 10;
  }

  return 0;
}

function isMeaningfullyDifferent(value: string | undefined, comparedValues: Array<string | undefined>) {
  const normalized = normalizeComparableText(value);
  if (!normalized) return false;
  return comparedValues.every((item) => normalizeComparableText(item) !== normalized);
}

function DictionaryContent() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") || searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "Tất cả";
  const regionParam = "Tất cả";
  const difficultyParam = "Tất cả";

  const [query, setQuery] = useState(searchParam);
  const [category, setCategory] = useState(categoryParam);
  const [region, setRegion] = useState(regionParam);
  const [difficulty, setDifficulty] = useState(difficultyParam);
  const [selected, setSelected] = useState<SignDictionaryItem | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [dictWords, setDictWords] = useState<SignDictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLetter, setActiveLetter] = useState("Tất cả");
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState("");

  useEffect(() => {
    setQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    setCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setRegion(regionParam);
  }, [regionParam]);

  useEffect(() => {
    setDifficulty(difficultyParam);
  }, [difficultyParam]);

  useEffect(() => {
    setFavoriteIds(readLocalArray(favoriteKey));
    setLearnedIds(readLocalArray(learnedKey));

    async function loadData() {
      try {
        if (!hasSupabaseEnv()) {
          setDictWords(signDictionaryData);
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase.from("dictionary_words").select("*").eq("status", "published");
        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: SignDictionaryItem[] = data.map((row: any) => ({
            id: row.id,
            word: row.word,
            normalizedWord: row.normalized_word || normalizeVietnameseText(row.word ?? ""),
            firstLetter: row.first_letter || "",
            meaning: row.meaning || "",
            simpleExplanation: row.simple_explanation || undefined,
            category: row.category || "Giao tiếp cơ bản",
            region: row.region || "Chưa xác định",
            difficulty: row.difficulty || "easy",
            exampleSentence: row.example_sentence || "",
            description: row.description || "",
            signSteps: Array.isArray(row.sign_steps) ? row.sign_steps : [],
            gifUrl: row.gif_url || undefined,
            videoUrl: row.video_url || undefined,
            thumbnailUrl: row.thumbnail_url || undefined,
            sourceName: row.source_name || undefined,
            sourceUrl: row.source_url || undefined,
            relatedWords: Array.isArray(row.related_words) ? row.related_words : [],
          }));
          setDictWords(mapped);
        } else {
          setDictWords(signDictionaryData);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Dictionary data fallback:", error);
        }
        setDictWords(signDictionaryData);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const baseFiltered = useMemo(() => {
    const trimmedQuery = query.trim();
    return dictWords
      .map((item, index) => ({ item, index, score: getSearchScore(item, trimmedQuery) }))
      .filter(({ item, score }) => {
        const matchesCategory = category === "Tất cả" || item.category === category;
        const matchesRegion = region === "Tất cả" || item.region === region;
        const matchesDifficulty = difficulty === "Tất cả" || item.difficulty === difficulty;
        return matchesCategory && matchesRegion && matchesDifficulty && (!trimmedQuery || score > 0);
      })
      .sort((a, b) => {
        if (trimmedQuery && b.score !== a.score) return b.score - a.score;
        const byWord = a.item.normalizedWord.localeCompare(b.item.normalizedWord, "vi");
        return byWord || a.index - b.index;
      })
      .map(({ item }) => item);
  }, [dictWords, query, category, region, difficulty]);

  const availableLetters = useMemo(() => {
    return new Set(baseFiltered.map((item) => item.firstLetter || getVietnameseFirstLetter(item.word)));
  }, [baseFiltered]);

  const filtered = useMemo(() => {
    if (activeLetter === "Tất cả") return baseFiltered;
    return baseFiltered.filter((item) => (item.firstLetter || getVietnameseFirstLetter(item.word)) === activeLetter);
  }, [activeLetter, baseFiltered]);

  const grouped = useMemo(() => groupDictionaryByLetter(filtered), [filtered]);
  const selectedIsFavorite = selected ? favoriteIds.includes(selected.id) : false;
  const selectedIsLearned = selected ? learnedIds.includes(selected.id) : false;

  useEffect(() => {
    if (activeLetter !== "Tất cả" && !availableLetters.has(activeLetter)) {
      setActiveLetter("Tất cả");
    }
  }, [activeLetter, availableLetters]);

  function toggleFavorite(item: SignDictionaryItem) {
    setFavoriteIds(toggleLocalItem(favoriteKey, item));
  }

  function toggleLearned(item: SignDictionaryItem) {
    setLearnedIds(toggleLocalItem(learnedKey, item));
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-8 text-slate-950 dark:from-slate-950 dark:to-slate-900 dark:text-slate-50 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <p className="font-black uppercase tracking-[0.18em] text-blue-500 dark:text-blue-300">CHẠM</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">Từ điển ký hiệu</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            Tra cứu nhanh từ vựng, cụm từ và ký hiệu thông dụng trong đời sống hằng ngày.
          </p>
        </div>

        <SectionCard className="mb-5 !p-3 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:!p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-3 py-1.5 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none sm:rounded-full">
            <Search className="h-5 w-5 shrink-0 text-blue-500 dark:text-blue-300" aria-hidden="true" />
            <label className="sr-only" htmlFor="dictionary-search">Tìm kiếm từ điển</label>
            <input
              id="dictionary-search"
              value={query}
              onChange={(event) => setQuery(event.target.value.slice(0, 100))}
              placeholder="Tìm từ, cụm từ hoặc chủ đề ký hiệu..."
              className="min-h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-50 dark:placeholder:text-slate-500 sm:text-base"
            />
          </div>

          <div className="mt-3 grid gap-2 md:max-w-sm">
            <FilterSelect label="Chủ đề" value={category} onChange={setCategory} options={["Tất cả", ...signCategories]} />
          </div>

          <div className="mt-3 overflow-x-auto pb-1" aria-label="Lọc theo chữ cái đầu">
            <div className="flex min-w-max gap-2">
              {["Tất cả", ...vietnameseAlphabet].map((letter) => {
                const disabled = letter !== "Tất cả" && !availableLetters.has(letter);
                const active = activeLetter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={disabled}
                    onClick={() => setActiveLetter(letter)}
                    className={cn(
                      "min-h-10 rounded-full border px-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                      active && "border-blue-700 bg-blue-700 text-white shadow-sm shadow-blue-200 dark:border-blue-500 dark:bg-blue-500",
                      !active && !disabled && "border-blue-100 bg-white text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-100 dark:hover:bg-slate-700",
                      disabled && "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600",
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-3 flex items-start gap-2 rounded-2xl bg-blue-50/70 px-3 py-2 text-xs font-semibold leading-5 text-blue-900 dark:bg-blue-500/10 dark:text-blue-100 sm:text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-200" aria-hidden="true" />
            <span>Lưu ý: Ký hiệu có thể thay đổi theo vùng và cần được xác minh bởi nguồn chuyên môn.</span>
          </p>
        </SectionCard>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
            <span className="font-bold text-slate-500 dark:text-slate-300">Đang tải từ điển...</span>
          </div>
        ) : (query.trim() || activeLetter !== "Tất cả" || category !== "Tất cả") && filtered.length === 0 ? (
          <EmptySearchState
            query={query}
            onContribute={() => {
              setSuggestionQuery(query);
              setIsSuggestionOpen(true);
            }}
          />
        ) : (
          <div className="grid gap-6">
            <div className="space-y-8">
              {filtered.length ? grouped.map((group) => group.items.length ? (
                <section key={group.letter} data-letter={group.letter} className="scroll-mt-36">
                  <h2 className="mb-3 flex items-center gap-3 text-2xl font-black text-blue-700 dark:text-blue-200 sm:text-3xl">
                    {group.letter}
                    <span className="h-px flex-1 bg-blue-100 dark:bg-slate-700" />
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
                    {group.items.map((item) => (
                      <DictionaryCard key={item.id} item={item} favorite={favoriteIds.includes(item.id)} learned={learnedIds.includes(item.id)} onFavorite={() => toggleFavorite(item)} onOpen={() => setSelected(item)} />
                    ))}
                  </div>
                </section>
              ) : null) : (
                <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                  <HelpCircle className="mx-auto h-12 w-12 text-blue-400" aria-hidden="true" />
                  <p className="mt-4 text-lg font-bold text-blue-900 dark:text-blue-100">Hãy gõ từ bạn cần tìm ở ô tìm kiếm phía trên.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CompactSignDetailModal
        item={selected}
        favorite={selectedIsFavorite}
        learned={selectedIsLearned}
        onClose={() => setSelected(null)}
        onFavorite={() => selected && toggleFavorite(selected)}
        onLearned={() => selected && toggleLearned(selected)}
      />

      <WordSuggestionModal
        isOpen={isSuggestionOpen}
        onClose={() => setIsSuggestionOpen(false)}
        initialQuery={suggestionQuery}
      />
    </main>
  );
}

export default function DictionaryPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] flex-1 items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8 dark:from-slate-950 dark:to-slate-900 sm:px-6 sm:py-12 lg:px-8">
          <div className="text-center font-bold text-slate-500 dark:text-slate-300">Đang tải từ điển...</div>
        </main>
      }
    >
      <DictionaryContent />
    </Suspense>
  );
}

function FilterSelect({ label, value, onChange, options, getLabel }: { label: string; value: string; onChange: (value: string) => void; options: string[]; getLabel?: (value: string) => string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-2xl border border-blue-100 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50">
        {options.map((option) => <option key={option} value={option}>{getLabel ? getLabel(option) : option}</option>)}
      </select>
    </label>
  );
}

function DictionaryCard({ item, favorite, learned, onFavorite, onOpen }: { item: SignDictionaryItem; favorite: boolean; learned: boolean; onFavorite: () => void; onOpen: () => void }) {
  return (
    <article role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => event.key === "Enter" && onOpen()} className={cn("grid cursor-pointer gap-2.5 rounded-2xl border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-900 dark:shadow-none", learned ? "border-emerald-300 bg-emerald-50/70 shadow-emerald-100/70 hover:border-emerald-400 dark:border-emerald-500/50 dark:bg-emerald-500/10" : "border-blue-100 shadow-blue-100/40 hover:border-blue-300 dark:border-slate-700", favorite && !learned ? "border-amber-200 bg-amber-50/50 shadow-amber-100/60 dark:border-amber-500/40 dark:bg-amber-500/10" : "")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {learned ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100">Đã học</span> : null}
            {favorite ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-500/20 dark:text-amber-100">Đã lưu</span> : null}
          </div>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-black leading-5 text-slate-950 dark:text-white">{item.word}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge className="bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-100 dark:ring-blue-500/20">{item.category}</Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFavorite();
          }}
          className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100", favorite ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-slate-800 dark:text-blue-200")}
          aria-label={favorite ? `Bấm để gỡ yêu thích ${item.word}` : `Lưu yêu thích ${item.word}`}
          title={favorite ? "Bấm để gỡ yêu thích" : "Lưu yêu thích"}
        >
          <Bookmark className={favorite ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
        </button>
      </div>
      <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">{item.simpleExplanation || item.description || item.meaning}</p>
    </article>
  );
}

function MediaRenderer({ item }: { item: SignDictionaryItem }) {
  if (item.videoUrl) {
    return (
      <div className="flex h-[170px] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 sm:h-[200px] lg:h-[220px]">
        <video src={item.videoUrl} poster={item.thumbnailUrl ?? undefined} className="h-full w-full object-contain" controls preload="metadata" />
      </div>
    );
  }

  if (item.gifUrl) {
    return (
      <div className="flex h-[170px] w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-50 dark:bg-slate-800 sm:h-[200px] lg:h-[220px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.gifUrl} alt={`GIF minh họa ${item.word}`} className="h-full w-full object-contain" />
      </div>
    );
  }

  if (item.thumbnailUrl) {
    return (
      <div className="flex h-[170px] w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-50 dark:bg-slate-800 sm:h-[200px] lg:h-[220px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.thumbnailUrl} alt={`Ảnh minh họa ${item.word}`} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="flex h-[150px] w-full items-center justify-center rounded-2xl bg-blue-50 text-center text-sm font-black text-blue-700 dark:bg-slate-800 dark:text-blue-200 sm:h-[180px] lg:h-[200px]">
      Minh họa đang được cập nhật
    </div>
  );
}

function EmptySearchState({ query, onContribute }: { query: string; onContribute?: () => void }) {
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="mx-auto max-w-2xl py-6">
      {/* Redesigned Empty State Card */}
      <section className="flex flex-col justify-between overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-md shadow-blue-100/30 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center">
          {/* Left illustration: Cute Sun + Magnifying Glass + Clouds */}
          <div className="flex shrink-0 items-center justify-center md:w-[32%]">
            <div className="relative p-2">
              <svg className="h-auto w-full max-w-[130px] text-blue-500" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Sun rays */}
                <path d="M100 30V15M100 185V170M30 100H15M185 100H170M50.5 50.5L40 40M160 160L149.5 149.5M50.5 149.5L40 160M160 40L149.5 50.5" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
                {/* Sun body */}
                <circle cx="100" cy="100" r="40" fill="#FBBF24" stroke="#F59E0B" strokeWidth="6" />
                {/* Sun eyes and smile */}
                <circle cx="88" cy="95" r="4.5" fill="#1E293B" />
                <circle cx="112" cy="95" r="4.5" fill="#1E293B" />
                <path d="M92 108C94 111 106 111 108 108" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
                {/* Decorative Clouds */}
                <path d="M50 140C40 140 30 130 30 120C30 108 40 100 52 100C58 85 75 75 92 80C100 83 108 90 112 98C120 98 128 104 130 112C135 120 130 135 120 140H50Z" fill="#CBD5E1" opacity="0.6" />
                <path d="M70 150C62 150 55 143 55 135C55 126 62 120 71 120C75 108 88 100 100 104C106 106 112 111 115 117C121 117 127 122 128 128C132 134 128 145 120 150H70Z" fill="#E2E8F0" />
                {/* Magnifying glass */}
                <g transform="translate(5, 5)">
                  <circle cx="115" cy="115" r="22" stroke="#3B82F6" strokeWidth="6" fill="#EFF6FF" />
                  <line x1="130" y1="130" x2="155" y2="155" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
                  <path d="M103 105C108 101 115 103 118 106" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
                </g>
              </svg>
            </div>
          </div>

          {/* Right text & buttons content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white lg:text-3xl">
              Chưa có ký hiệu cho &quot;{query}&quot;
            </h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
              Từ này hiện chưa có trong từ điển CHẠM. Bạn có thể nhờ AI giải thích nghĩa hoặc đề xuất thêm từ mới để đội ngũ kiểm duyệt.
            </p>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col flex-wrap gap-3 sm:flex-row sm:justify-center md:justify-start">
              <button
                type="button"
                onClick={() => setShowAI(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 text-sm font-black text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
              >
                <Sparkles className="h-4 w-4" />
                Nhờ AI giải thích nghĩa từ này
              </button>

              <button
                type="button"
                onClick={onContribute}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-black text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                <HelpCircle className="h-4 w-4" />
                Đóng góp từ điển
              </button>
            </div>

            {/* AI response placeholder notice */}
            {showAI && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-left dark:border-slate-800 dark:bg-slate-950/30">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                      AI hỗ trợ đang trong quá trình phát triển
                    </p>
                    <p className="mt-1 text-[11px] font-medium leading-4 text-blue-600 dark:text-blue-400/80">
                      Tính năng giải thích nghĩa từ &quot;{query}&quot; bằng AI sẽ sớm được ra mắt. Cảm ơn bạn đã quan tâm!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom banner note */}
        <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50/70 px-6 py-3 text-xs font-semibold text-amber-800 dark:border-amber-950/20 dark:bg-amber-950/10 dark:text-amber-300">
          <span className="text-sm">🛡️</span>
          <span>Mọi đóng góp sẽ được kiểm duyệt bởi đội ngũ chuyên môn trước khi xuất bản.</span>
        </div>
      </section>
    </div>
  );
}

function CompactSignDetailModal({
  item,
  favorite,
  learned,
  onClose,
  onFavorite,
  onLearned,
}: {
  item: SignDictionaryItem | null;
  favorite: boolean;
  learned: boolean;
  onClose: () => void;
  onFavorite: () => void;
  onLearned: () => void;
}) {
  const simpleExplanation = item?.simpleExplanation;
  const description = item?.description;
  const showSimpleExplanation = item ? isMeaningfullyDifferent(simpleExplanation, [item.meaning]) : false;
  const showDescription = item ? isMeaningfullyDifferent(description, [item.meaning, simpleExplanation]) : false;
  const showExample = Boolean(item?.exampleSentence?.trim());
  const showSteps = Boolean(item?.signSteps.length);

  return (
    <Dialog.Root open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[86dvh] w-[calc(100vw-24px)] max-w-[920px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.35rem] border border-blue-100 bg-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900">
          {item ? (
            <>
              {/* ─── Header ─── */}
              <div className="shrink-0 px-5 pb-3 pt-5 sm:px-7 sm:pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Dialog.Title className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">{item.word}</Dialog.Title>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{item.category}</span>
                      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">{regionLabels[item.region as keyof typeof regionLabels] ?? item.region}</span>
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{difficultyLabels[item.difficulty]}</span>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-800 dark:text-slate-100" aria-label="Đóng">
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              {/* ─── Scrollable content ─── */}
              <div className="scrollbar-hide flex-1 overflow-y-auto">
                <div className="px-5 pb-5 sm:px-7">
                  {/* ─── Word Info Section ─── */}
                  <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:items-start">
                    {/* Left: Video / Media */}
                    <div className="overflow-hidden rounded-2xl bg-slate-900">
                      <MediaRenderer item={item} />
                    </div>

                    {/* Right: Info Cards */}
                    <div className="grid gap-3">
                      {item.meaning ? (
                        <div className="rounded-xl border border-blue-100 bg-white p-3.5">
                          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">📖</span>
                            Ý nghĩa
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.meaning}</p>
                        </div>
                      ) : null}
                      {showSimpleExplanation ? (
                        <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-50 text-violet-600">💡</span>
                            Giải thích đơn giản
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{simpleExplanation}</p>
                        </div>
                      ) : null}
                      {showDescription ? (
                        <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-600">📝</span>
                            Ghi chú
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                        </div>
                      ) : null}
                      {showExample ? (
                        <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">💬</span>
                            Ví dụ
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.exampleSentence}</p>
                        </div>
                      ) : null}
                      {showSteps ? (
                        <div className="rounded-xl border border-blue-100 bg-white p-3.5">
                          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">📋</span>
                            Các bước học
                          </div>
                          <ol className="mt-2 grid gap-1.5">
                            {item.signSteps.slice(0, 4).map((step, i) => (
                              <li key={step} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[11px] font-black text-blue-700">{i + 1}</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* ─── AI Explanation (compact) ─── */}
                  <div className="mt-4">
                    <AIExplanation word={item.word} hasSignData context={`Nghĩa: ${item.meaning}. Ví dụ: ${item.exampleSentence}`} />
                  </div>

                  {/* ─── Regional Warning ─── */}
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    ⚠️ Ký hiệu có thể thay đổi theo vùng và cần được xác minh bởi nguồn chuyên môn.
                  </div>

                  {/* ─── Community Section ─── */}
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900">
                      <span className="text-xl">👥</span>
                      Cộng đồng
                    </h3>

                    {/* Community Videos (full width, above comments) */}
                    <div className="mb-5">
                      <CommunityVideos wordId={item.id} wordText={item.word} />
                    </div>

                    {/* Comment Composer & Comment List */}
                    <WordComments wordId={item.id} />
                  </div>
                </div>
              </div>

              {/* ─── Footer Actions ─── */}
              <div className="shrink-0 grid gap-2 border-t border-slate-100 bg-white p-3 sm:grid-cols-3 sm:p-4">
                <Button variant={learned ? "success" : "secondary"} onClick={onLearned} className="min-h-11 rounded-full text-sm" aria-label={learned ? "Bấm để gỡ đã học" : "Đánh dấu đã học"} title={learned ? "Bấm để gỡ đã học" : "Đánh dấu đã học"}>
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  {learned ? "Đã học" : "Đánh dấu đã học"}
                </Button>
                <Button variant={favorite ? "default" : "secondary"} onClick={onFavorite} className={cn("min-h-11 rounded-full text-sm", favorite ? "bg-amber-500 text-white hover:bg-amber-600" : "")} aria-label={favorite ? "Bấm để gỡ yêu thích" : "Lưu yêu thích"} title={favorite ? "Bấm để gỡ yêu thích" : "Lưu yêu thích"}>
                  <Bookmark className={favorite ? "h-5 w-5 fill-current" : "h-5 w-5"} aria-hidden="true" />
                  {favorite ? "Đã lưu" : "Lưu yêu thích"}
                </Button>
                <Dialog.Close asChild>
                  <Button variant="outline" className="min-h-11 rounded-full text-sm">Đóng</Button>
                </Dialog.Close>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
