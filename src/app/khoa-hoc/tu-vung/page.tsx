"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Bookmark, CheckCircle2, ImageIcon, Loader2, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vocabularyCourseData } from "@/data/vocabularyCourseData";
import { vocabularyCourseTopics } from "@/data/vocabularyCourseTopics";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type VocabularyCourseItem = {
  id: string;
  word_key: string;
  word: string;
  category: string;
  meaning?: string | null;
  description?: string | null;
  simple_explanation?: string | null;
  example_sentence?: string | null;
  sign_steps?: string[] | null;
  tips?: string[] | null;
  video_url?: string | null;
  gif_url?: string | null;
  thumbnail_url?: string | null;
};

const learnedKey = "cham_learned_signs";
const favoriteKey = "cham_favorite_signs";

const defaultSteps = [
  "Quan sát minh họa ký hiệu khi nhóm bổ sung dữ liệu.",
  "Giữ tay trong khung nhìn rõ.",
  "Thực hiện chậm và lặp lại 3-5 lần.",
];

function readStorage(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => (typeof item === "string" ? item : String((item as { id?: string }).id ?? ""))).filter(Boolean);
  } catch {
    return [];
  }
}

function saveStorage(key: string, id: string) {
  if (typeof window === "undefined") return [];
  const next = Array.from(new Set([id, ...readStorage(key)]));
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

function toggleStorage(key: string, id: string) {
  if (typeof window === "undefined") return [];
  const current = readStorage(key);
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

function getVocabularyItemKey(item: VocabularyCourseItem, index: number) {
  return item.id || `${item.category}-${index}-${item.word_key || item.word}`;
}

function slugifyTopic(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function MediaPreview({ item }: { item: VocabularyCourseItem }) {
  const [failed, setFailed] = useState(false);

  if (item.video_url) {
    return (
      <div className="flex h-[170px] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 sm:h-[200px] lg:h-[220px]">
        <video src={item.video_url} poster={item.thumbnail_url ?? undefined} controls preload="metadata" className="h-full w-full object-contain" />
      </div>
    );
  }

  if (item.gif_url && !failed) {
    return (
      <div className="flex h-[170px] w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-50 dark:bg-slate-800 sm:h-[200px] lg:h-[220px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.gif_url} alt={`GIF minh họa ${item.word}`} className="h-full w-full object-contain" onError={() => setFailed(true)} />
      </div>
    );
  }

  if (item.thumbnail_url && !failed) {
    return (
      <div className="flex h-[170px] w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-50 dark:bg-slate-800 sm:h-[200px] lg:h-[220px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.thumbnail_url} alt={`Ảnh minh họa ${item.word}`} className="h-full w-full object-contain" onError={() => setFailed(true)} />
      </div>
    );
  }

  return (
    <div className="flex h-[160px] w-full items-center justify-center rounded-2xl bg-blue-50 text-center text-sm font-black text-blue-700 dark:bg-slate-800 dark:text-blue-200 sm:h-[190px] lg:h-[210px]">
      <div className="grid place-items-center gap-1.5">
        <ImageIcon className="h-7 w-7" aria-hidden="true" />
        Đang cập nhật minh họa
      </div>
    </div>
  );
}

function VocabularyDetailModal({
  item,
  learned,
  favorite,
  onClose,
  onLearned,
  onFavorite,
}: {
  item: VocabularyCourseItem | null;
  learned: boolean;
  favorite: boolean;
  onClose: () => void;
  onLearned: () => void;
  onFavorite: () => void;
}) {
  return (
    <Dialog.Root open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="scrollbar-hide fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[calc(100vw-24px)] max-w-[900px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.35rem] border border-blue-100 bg-white p-4 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          {item ? (
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">{item.category}</p>
                  <Dialog.Title className="mt-2 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">{item.word}</Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-800 dark:text-slate-100" aria-label="Đóng">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
                <MediaPreview item={item} />
                <div className="grid gap-3">
                  <section className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                    <h3 className="font-black text-slate-950 dark:text-white">Ghi chú / mô tả</h3>
                    <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item.description || "Chưa có ghi chú riêng cho mục này."}</p>
                  </section>
                  <section className="rounded-2xl bg-blue-50 p-3 dark:bg-blue-500/15">
                    <h3 className="font-black text-slate-950 dark:text-white">Ý nghĩa</h3>
                    <p className="mt-1.5 text-sm font-semibold leading-6 text-blue-900 dark:text-blue-100">{item.meaning || `Thuộc chủ đề ${item.category}, dùng trong giao tiếp ngôn ngữ ký hiệu.`}</p>
                  </section>
                  <section>
                    <h3 className="font-black text-slate-950 dark:text-white">Giải thích đơn giản</h3>
                    <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item.simple_explanation || item.description}</p>
                  </section>
                  <section>
                    <h3 className="font-black text-slate-950 dark:text-white">Ví dụ</h3>
                    <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item.example_sentence || `Em học ký hiệu cho cụm từ: ${item.word}.`}</p>
                  </section>
                </div>
              </div>

              <section>
                <h3 className="font-black text-slate-950 dark:text-white">Các bước học</h3>
                <ul className="mt-2 grid gap-2">
                  {(item.sign_steps?.length ? item.sign_steps : defaultSteps).map((step) => (
                    <li key={step} className="break-words rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-900 dark:bg-blue-500/15 dark:text-blue-100">
                      {step}
                    </li>
                  ))}
                </ul>
              </section>

              {item.tips?.length ? (
                <section>
                  <h3 className="font-black text-slate-950 dark:text-white">Lưu ý</h3>
                  <ul className="mt-2 grid gap-2">
                    {item.tips.map((tip) => (
                      <li key={tip} className="break-words rounded-2xl bg-orange-50 px-3 py-2 text-sm font-semibold leading-6 text-orange-900 dark:bg-orange-500/15 dark:text-orange-100">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <Link href={`/tu-dien?q=${encodeURIComponent(item.word)}`} className="w-fit rounded-full bg-blue-50 px-3 py-2 text-sm font-black text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-100">
                Xem trong từ điển
              </Link>

              <div className="grid gap-2 border-t border-blue-100 pt-3 dark:border-slate-700 sm:grid-cols-3">
                <Button variant={learned ? "success" : "secondary"} onClick={onLearned} className="min-h-11 rounded-full text-sm">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  {learned ? "Đã học" : "Đánh dấu đã học"}
                </Button>
                <Button variant={favorite ? "default" : "secondary"} onClick={onFavorite} className="min-h-11 rounded-full text-sm">
                  <Bookmark className={favorite ? "h-5 w-5 fill-blue-700" : "h-5 w-5"} aria-hidden="true" />
                  {favorite ? "Đã lưu yêu thích" : "Lưu yêu thích"}
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

export default function VocabularyCoursePage() {
  const [items, setItems] = useState<VocabularyCourseItem[]>(vocabularyCourseData);
  const [activeTopic, setActiveTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [learned, setLearned] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<VocabularyCourseItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLearned(readStorage(learnedKey));
    setFavorites(readStorage(favoriteKey));
    const topicParam = new URLSearchParams(window.location.search).get("topic");
    if (topicParam) {
      const matchedTopic = vocabularyCourseTopics.find((topic) => topic.slug === topicParam || slugifyTopic(topic.name) === topicParam);
      if (matchedTopic) setActiveTopic(matchedTopic.name);
    }

    async function loadVocabulary() {
      if (!hasSupabaseEnv()) {
        setItems(vocabularyCourseData);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("dictionary_words")
          .select("id, word_key, word, category, meaning, description, simple_explanation, example_sentence, sign_steps, video_url, gif_url, thumbnail_url")
          .eq("status", "published")
          .in("category", vocabularyCourseTopics.map((topic) => topic.name))
          .order("category", { ascending: true })
          .order("word", { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setItems(data as VocabularyCourseItem[]);
        } else {
          setItems(vocabularyCourseData);
        }
      } catch (error) {
        console.error("Vocabulary course load error:", error);
        setItems(vocabularyCourseData);
      } finally {
        setLoading(false);
      }
    }

    loadVocabulary();
  }, []);

  const topicCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => counts.set(item.category, (counts.get(item.category) ?? 0) + 1));
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTopic = activeTopic === "all" || item.category === activeTopic;
      const searchable = [item.word, item.category, item.description, item.simple_explanation, item.meaning].join(" ").toLowerCase();
      return matchesTopic && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeTopic, items, query]);

  function markLearned(item: VocabularyCourseItem) {
    setLearned(toggleStorage(learnedKey, item.word_key || item.id));
  }

  function saveFavorite(item: VocabularyCourseItem) {
    setFavorites(toggleStorage(favoriteKey, item.id));
  }

  const selectedIsLearned = selectedItem ? learned.includes(selectedItem.word_key || selectedItem.id) : false;
  const selectedIsFavorite = selectedItem ? favorites.includes(selectedItem.id) : false;

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-50 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-5 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Khóa học
            </p>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">Từ vựng theo chủ đề</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              Học các từ và câu giao tiếp cơ bản bằng ngôn ngữ ký hiệu.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-3xl bg-blue-50 px-5 py-4 text-blue-900 dark:bg-blue-500/15 dark:text-blue-100">
              <p className="text-2xl font-black">{items.length}</p>
              <p className="text-xs font-black uppercase">mục từ vựng</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-5 py-4 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100">
              <p className="text-2xl font-black">10</p>
              <p className="text-xs font-black uppercase">chủ đề</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-blue-100 bg-white p-4 shadow-lg shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 dark:border-slate-700 dark:bg-slate-800">
            <Search className="h-5 w-5 text-blue-700 dark:text-blue-200" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm từ, câu giao tiếp hoặc ghi chú..."
              className="min-h-12 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400 dark:text-slate-50"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => setActiveTopic("all")} className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-black ${activeTopic === "all" ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-800 dark:bg-slate-800 dark:text-blue-100"}`}>
              Tất cả
            </button>
            {vocabularyCourseTopics.map((topic) => (
              <button key={topic.slug} type="button" onClick={() => setActiveTopic(topic.name)} className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-black ${activeTopic === topic.name ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-800 dark:bg-slate-800 dark:text-blue-100"}`}>
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-6">
          {loading ? (
            <div className="flex justify-center rounded-[2rem] bg-white py-16 dark:bg-slate-900">
              <Loader2 className="h-9 w-9 animate-spin text-blue-700" aria-hidden="true" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-blue-200 bg-white p-8 text-center font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Chưa có dữ liệu phù hợp. Hãy thử chủ đề hoặc từ khóa khác.
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
              {filteredItems.map((item, index) => {
                const itemLearned = learned.includes(item.word_key || item.id);
                const itemFavorite = favorites.includes(item.id);

                return (
                  <article key={getVocabularyItemKey(item, index)} role="button" tabIndex={0} onClick={() => setSelectedItem(item)} onKeyDown={(event) => event.key === "Enter" && setSelectedItem(item)} className="grid cursor-pointer gap-2.5 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm shadow-blue-100/40 transition hover:-translate-y-0.5 hover:border-blue-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
                    <div>
                      <p className="line-clamp-2 min-h-[2.5rem] text-base font-black leading-5 text-slate-950 dark:text-white">{item.word}</p>
                      <p className="mt-1.5 w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">{item.category}</p>
                      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                        {item.simple_explanation || item.description || `Từ/cụm từ thường dùng trong chủ đề ${item.category}.`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" variant={itemLearned ? "success" : "secondary"} onClick={(event) => { event.stopPropagation(); markLearned(item); }} className="min-h-9 flex-1 rounded-full px-2 text-xs">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        {itemLearned ? "Đã học" : "Học"}
                      </Button>
                      <Button type="button" size="sm" variant={itemFavorite ? "default" : "secondary"} onClick={(event) => { event.stopPropagation(); saveFavorite(item); }} className="min-h-9 w-10 rounded-full px-0" aria-label={itemFavorite ? "Đã lưu yêu thích" : "Lưu yêu thích"}>
                        <Bookmark className={itemFavorite ? "h-4 w-4 fill-blue-700" : "h-4 w-4"} aria-hidden="true" />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>

      <VocabularyDetailModal
        item={selectedItem}
        learned={selectedIsLearned}
        favorite={selectedIsFavorite}
        onClose={() => setSelectedItem(null)}
        onLearned={() => selectedItem && markLearned(selectedItem)}
        onFavorite={() => selectedItem && saveFavorite(selectedItem)}
      />
    </main>
  );
}
