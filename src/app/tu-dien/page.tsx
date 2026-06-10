"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Bookmark, CheckCircle2, HelpCircle, Info, Loader2, Search, Sparkles, X } from "lucide-react";
import { AIExplanation } from "@/components/dictionary/AIExplanation";
import { CommunityVideos } from "@/components/dictionary/CommunityVideos";
import { WordComments } from "@/components/dictionary/WordComments";
import { SectionCard } from "@/components/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signCategories, signDictionaryData, signRegions, type SignDictionaryItem } from "@/data/signDictionaryData";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { getDictionaryLetterId, groupDictionaryByLetter, normalizeVietnameseText, vietnameseAlphabet } from "@/lib/vietnameseText";

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

function readLocalArray(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeLocalArray(key: string, ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
}

function toggleLocalId(key: string, id: string) {
  const current = readLocalArray(key);
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  writeLocalArray(key, next);
  return next;
}

function scrollToLetter(letter: string) {
  document.getElementById(getDictionaryLetterId(letter))?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function slugifyTopic(value: string) {
  return normalizeVietnameseText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeComparableText(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
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
  const regionParam = searchParams.get("region") || "Tất cả";
  const difficultyParam = searchParams.get("difficulty") || "Tất cả";

  const [query, setQuery] = useState(searchParam);
  const [category, setCategory] = useState(categoryParam);
  const [region, setRegion] = useState(regionParam);
  const [difficulty, setDifficulty] = useState(difficultyParam);
  const [selected, setSelected] = useState<SignDictionaryItem | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [dictWords, setDictWords] = useState<SignDictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeVietnameseText(query);
    return dictWords
      .filter((item) => {
        const matchesCategory = category === "Tất cả" || item.category === category;
        const matchesRegion = region === "Tất cả" || item.region === region;
        const matchesDifficulty = difficulty === "Tất cả" || item.difficulty === difficulty;
        const searchable = [item.word, item.normalizedWord, item.meaning, item.category, item.exampleSentence, item.description, ...item.relatedWords]
          .map(normalizeVietnameseText)
          .join(" ");
        return matchesCategory && matchesRegion && matchesDifficulty && (!normalizedQuery || searchable.includes(normalizedQuery));
      })
      .sort((a, b) => a.normalizedWord.localeCompare(b.normalizedWord, "vi"));
  }, [dictWords, query, category, region, difficulty]);

  const grouped = useMemo(() => groupDictionaryByLetter(filtered), [filtered]);
  const lettersWithData = new Set(grouped.filter((group) => group.items.length).map((group) => group.letter));
  const selectedIsFavorite = selected ? favoriteIds.includes(selected.id) : false;
  const selectedIsLearned = selected ? learnedIds.includes(selected.id) : false;

  function toggleFavorite(id: string) {
    setFavoriteIds(toggleLocalId(favoriteKey, id));
  }

  function toggleLearned(id: string) {
    setLearnedIds(toggleLocalId(learnedKey, id));
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

          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <FilterSelect label="Chủ đề" value={category} onChange={setCategory} options={["Tất cả", ...signCategories]} />
            <FilterSelect label="Khu vực" value={region} onChange={setRegion} options={["Tất cả", ...signRegions]} getLabel={(value) => value === "Tất cả" ? value : regionLabels[value as keyof typeof regionLabels]} />
            <FilterSelect label="Độ khó" value={difficulty} onChange={setDifficulty} options={["Tất cả", "easy", "medium", "hard"]} getLabel={(value) => value === "Tất cả" ? value : difficultyLabels[value as keyof typeof difficultyLabels]} />
          </div>

          <div className="sticky top-24 z-20 mt-3 flex gap-2 overflow-x-auto rounded-full bg-white/95 py-1.5 dark:bg-slate-900/95 lg:hidden">
            {vietnameseAlphabet.map((letter) => (
              <button key={letter} type="button" disabled={!lettersWithData.has(letter)} onClick={() => scrollToLetter(letter)} className={`h-9 min-w-9 rounded-full text-sm font-black ${lettersWithData.has(letter) ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100" : "bg-slate-50 text-slate-300 dark:bg-slate-800 dark:text-slate-600"}`}>
                {letter}
              </button>
            ))}
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
        ) : query.trim() && filtered.length === 0 ? (
          <EmptySearchState query={query} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="space-y-8">
              {filtered.length ? grouped.map((group) => group.items.length ? (
                <section key={group.letter} id={getDictionaryLetterId(group.letter)} className="scroll-mt-36">
                  <h2 className="mb-3 flex items-center gap-3 text-2xl font-black text-blue-700 dark:text-blue-200 sm:text-3xl">
                    {group.letter}
                    <span className="h-px flex-1 bg-blue-100 dark:bg-slate-700" />
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
                    {group.items.map((item) => (
                      <DictionaryCard key={item.id} item={item} favorite={favoriteIds.includes(item.id)} onFavorite={() => toggleFavorite(item.id)} onOpen={() => setSelected(item)} />
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

            <aside className="sticky top-28 hidden h-fit rounded-full border border-blue-100 bg-white p-2 shadow-lg shadow-blue-100/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none lg:block" aria-label="Chỉ mục chữ cái">
              <div className="grid gap-1">
                {vietnameseAlphabet.map((letter) => (
                  <button key={letter} type="button" disabled={!lettersWithData.has(letter)} onClick={() => scrollToLetter(letter)} className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition ${lettersWithData.has(letter) ? "text-blue-700 hover:bg-blue-50 dark:text-blue-100 dark:hover:bg-slate-800" : "text-slate-300 dark:text-slate-600"}`}>
                    {letter}
                  </button>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>

      <CompactSignDetailModal
        item={selected}
        favorite={selectedIsFavorite}
        learned={selectedIsLearned}
        onClose={() => setSelected(null)}
        onFavorite={() => selected && toggleFavorite(selected.id)}
        onLearned={() => selected && toggleLearned(selected.id)}
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

function DictionaryCard({ item, favorite, onFavorite, onOpen }: { item: SignDictionaryItem; favorite: boolean; onFavorite: () => void; onOpen: () => void }) {
  return (
    <article role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => event.key === "Enter" && onOpen()} className="grid cursor-pointer gap-2.5 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm shadow-blue-100/40 transition hover:-translate-y-0.5 hover:border-blue-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-black leading-5 text-slate-950 dark:text-white">{item.word}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge className="bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-100 dark:ring-blue-500/20">{item.category}</Badge>
            <Badge className="bg-sky-50 px-2 py-0.5 text-[11px] text-sky-800 ring-sky-100 dark:bg-sky-500/15 dark:text-sky-100 dark:ring-sky-500/20">{regionLabels[item.region as keyof typeof regionLabels] ?? item.region}</Badge>
            <Badge className="bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-800 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-500/20">{difficultyLabels[item.difficulty]}</Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFavorite();
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-800 dark:text-blue-200"
          aria-label={favorite ? `Bỏ yêu thích ${item.word}` : `Lưu yêu thích ${item.word}`}
        >
          <Bookmark className={favorite ? "h-4 w-4 fill-blue-700" : "h-4 w-4"} aria-hidden="true" />
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

function EmptySearchState({ query }: { query: string }) {
  const wordId = normalizeVietnameseText(query);

  return (
    <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-lg shadow-blue-100/30 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-200">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-black uppercase">AI hỗ trợ</span>
        </div>
        <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Chưa có ký hiệu cho &quot;{query}&quot;</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">
          Bạn có thể nhờ AI giải thích nghĩa từ này hoặc đóng góp video ký hiệu để làm phong phú từ điển.
        </p>
        <div className="mt-4">
          <AIExplanation word={query} hasSignData={false} />
        </div>
      </section>
      <div className="grid gap-3">
        <CommunityVideos wordId={wordId} wordText={query} compactEmpty />
        <WordComments wordId={wordId} compact />
      </div>
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
              <div className="flex items-start justify-between gap-3 border-b border-blue-100 p-4 dark:border-slate-700 sm:p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{item.category}</Badge>
                    <Badge className="bg-sky-50 text-sky-800 ring-sky-100 dark:bg-sky-500/15 dark:text-sky-100 dark:ring-sky-500/20">{regionLabels[item.region as keyof typeof regionLabels] ?? item.region}</Badge>
                    <Badge className="bg-emerald-50 text-emerald-800 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-500/20">{difficultyLabels[item.difficulty]}</Badge>
                  </div>
                  <Dialog.Title className="mt-2 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">{item.word}</Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-800 dark:text-slate-100" aria-label="Đóng">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="scrollbar-hide flex-1 overflow-y-auto p-4 pb-5 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-[0.36fr_0.64fr] lg:items-start">
                  <MediaRenderer item={item} />
                  <div className="grid gap-3">
                    {item.meaning ? (
                      <section className="rounded-2xl bg-blue-50 p-3 dark:bg-blue-500/15">
                        <h3 className="font-black text-slate-950 dark:text-white">Ý nghĩa</h3>
                        <p className="mt-1.5 text-sm font-semibold leading-6 text-blue-900 dark:text-blue-100">{item.meaning}</p>
                      </section>
                    ) : null}
                    {showSimpleExplanation ? (
                      <section className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                        <h3 className="font-black text-slate-950 dark:text-white">Giải thích đơn giản</h3>
                        <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{simpleExplanation}</p>
                      </section>
                    ) : null}
                    {showDescription ? (
                      <section>
                        <h3 className="font-black text-slate-950 dark:text-white">Ghi chú / mô tả</h3>
                        <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                      </section>
                    ) : null}
                    {showExample ? (
                      <section>
                        <h3 className="font-black text-slate-950 dark:text-white">Ví dụ</h3>
                        <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item.exampleSentence}</p>
                      </section>
                    ) : null}
                    <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                      <AIExplanation word={item.word} hasSignData context={`Nghĩa: ${item.meaning}. Ví dụ: ${item.exampleSentence}`} />
                    </section>
                    <Link href={`/khoa-hoc/tu-vung?topic=${encodeURIComponent(slugifyTopic(item.category))}`} className="w-fit rounded-full bg-blue-50 px-3 py-2 text-sm font-black text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-100">
                      Học trong chủ đề: {item.category}
                    </Link>
                  </div>
                </div>

                {showSteps ? (
                  <section className="mt-4">
                    <h3 className="font-black text-slate-950 dark:text-white">Các bước học</h3>
                    <ul className="mt-2 grid gap-2">
                      {item.signSteps.slice(0, 4).map((step) => (
                        <li key={step} className="break-words rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-900 dark:bg-blue-500/15 dark:text-blue-100">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <details className="mt-4 rounded-2xl border border-blue-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                  <summary className="cursor-pointer text-sm font-black text-blue-700 dark:text-blue-100">Đóng góp video và bình luận</summary>
                  <div className="mt-3 grid gap-3">
                    <CommunityVideos wordId={item.id} wordText={item.word} compactEmpty />
                    <WordComments wordId={item.id} compact />
                  </div>
                </details>

                <p className="mt-4 rounded-2xl bg-orange-50 p-3 text-sm font-semibold leading-6 text-orange-900 dark:bg-orange-500/15 dark:text-orange-100">
                  Lưu ý: Ký hiệu có thể thay đổi theo vùng và cần được xác minh bởi nguồn chuyên môn.
                </p>
              </div>

              <div className="sticky bottom-0 grid gap-2 border-t border-blue-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-3 sm:p-4">
                <Button variant={learned ? "success" : "secondary"} onClick={onLearned} className="min-h-11 rounded-full text-sm">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  {learned ? "Đã học" : "Đánh dấu đã học"}
                </Button>
                <Button variant={favorite ? "default" : "secondary"} onClick={onFavorite} className="min-h-11 rounded-full text-sm">
                  <Bookmark className={favorite ? "h-5 w-5 fill-blue-700" : "h-5 w-5"} aria-hidden="true" />
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

function SignDetailModal({
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
  return (
    <Dialog.Root open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="scrollbar-hide fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[calc(100vw-24px)] max-w-[920px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.35rem] border border-blue-100 bg-white p-4 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          {item ? (
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{item.category}</Badge>
                    <Badge className="bg-sky-50 text-sky-800 ring-sky-100 dark:bg-sky-500/15 dark:text-sky-100 dark:ring-sky-500/20">{regionLabels[item.region as keyof typeof regionLabels] ?? item.region}</Badge>
                    <Badge className="bg-emerald-50 text-emerald-800 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-500/20">{difficultyLabels[item.difficulty]}</Badge>
                  </div>
                  <Dialog.Title className="mt-2 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">{item.word}</Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-800 dark:text-slate-100" aria-label="Đóng">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
                <MediaRenderer item={item} />
                <div className="grid gap-3">
                  <section className="rounded-2xl bg-blue-50 p-3 dark:bg-blue-500/15">
                    <h3 className="font-black text-slate-950 dark:text-white">Ý nghĩa</h3>
                    <p className="mt-1.5 text-sm font-semibold leading-6 text-blue-900 dark:text-blue-100">{item.meaning}</p>
                  </section>
                  <section className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                    <h3 className="font-black text-slate-950 dark:text-white">Giải thích đơn giản</h3>
                    <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item.simpleExplanation || item.description || "Chưa có ghi chú riêng cho mục này."}</p>
                  </section>
                  <section>
                    <h3 className="font-black text-slate-950 dark:text-white">Ví dụ</h3>
                    <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item.exampleSentence || `Em học ký hiệu cho cụm từ: ${item.word}.`}</p>
                  </section>
                  <Link href={`/khoa-hoc/tu-vung?topic=${encodeURIComponent(slugifyTopic(item.category))}`} className="w-fit rounded-full bg-blue-50 px-3 py-2 text-sm font-black text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-100">
                    Học trong chủ đề: {item.category}
                  </Link>
                </div>
              </div>

              {item.signSteps.length ? (
                <section>
                  <h3 className="font-black text-slate-950 dark:text-white">Các bước học</h3>
                  <ul className="mt-2 grid gap-2">
                    {item.signSteps.slice(0, 4).map((step) => (
                      <li key={step} className="break-words rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-900 dark:bg-blue-500/15 dark:text-blue-100">
                        {step}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                <AIExplanation word={item.word} hasSignData context={`Nghĩa: ${item.meaning}. Ví dụ: ${item.exampleSentence}`} />
              </section>

              <details className="rounded-2xl border border-blue-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <summary className="cursor-pointer text-sm font-black text-blue-700 dark:text-blue-100">Đóng góp video và bình luận</summary>
                <div className="mt-3 grid gap-3">
                  <CommunityVideos wordId={item.id} wordText={item.word} />
                  <WordComments wordId={item.id} />
                </div>
              </details>

              <p className="rounded-2xl bg-orange-50 p-3 text-sm font-semibold leading-6 text-orange-900 dark:bg-orange-500/15 dark:text-orange-100">
                Ký hiệu có thể khác nhau theo vùng. Nội dung trong bản demo cần được xác minh bởi giáo viên hoặc nguồn chuyên môn.
              </p>

              <div className="grid gap-2 border-t border-blue-100 pt-3 dark:border-slate-700 sm:grid-cols-3">
                <Button variant={learned ? "success" : "secondary"} onClick={onLearned} className="min-h-11 rounded-full text-sm">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  {learned ? "Đã học" : "Đánh dấu đã học"}
                </Button>
                <Button variant={favorite ? "default" : "secondary"} onClick={onFavorite} className="min-h-11 rounded-full text-sm">
                  <Bookmark className={favorite ? "h-5 w-5 fill-blue-700" : "h-5 w-5"} aria-hidden="true" />
                  {favorite ? "Đã lưu" : "Lưu yêu thích"}
                </Button>
                <Dialog.Close asChild>
                  <Button variant="outline" className="min-h-11 rounded-full text-sm">Đóng</Button>
                </Dialog.Close>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
