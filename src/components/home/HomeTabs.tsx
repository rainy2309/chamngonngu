"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Bookmark, LibraryBig, Loader2, MessagesSquare, SpellCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vocabularyCourseData } from "@/data/vocabularyCourseData";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type FeaturedWord = {
  id: string;
  word: string;
  category: string;
  description: string;
};

const favoriteKey = "cham_favorite_signs";

const featuredWords = ["Xin chào", "Cảm ơn", "Gia đình", "Bạn bè", "Ăn", "Uống", "Giúp tôi", "Tạm biệt"];

const quickPaths = [
  {
    title: "Từ điển",
    description: "Tra cứu ký hiệu và nghĩa của từ.",
    href: "/tu-dien",
    icon: LibraryBig,
  },
  {
    title: "Từ vựng",
    description: "Học theo chủ đề ngắn gọn.",
    href: "/khoa-hoc/tu-vung",
    icon: BookOpen,
  },
  {
    title: "Bảng chữ cái",
    description: "Làm quen chữ cái và dấu.",
    href: "/khoa-hoc/bang-chu-cai",
    icon: SpellCheck,
  },
  {
    title: "Cộng đồng",
    description: "Giao tiếp hòa nhập hơn.",
    href: "/cong-dong",
    icon: MessagesSquare,
  },
];

function readFavorites() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(favoriteKey) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function toFeaturedWord(row: {
  id: string;
  word: string;
  category: string;
  description?: string | null;
  simple_explanation?: string | null;
  meaning?: string | null;
}): FeaturedWord {
  return {
    id: row.id,
    word: row.word,
    category: row.category,
    description: row.description || row.simple_explanation || row.meaning || "Từ vựng thông dụng trong giao tiếp hằng ngày.",
  };
}

function pickFeaturedWords(items: FeaturedWord[]) {
  const selected = featuredWords
    .map((word) => items.find((item) => item.word.toLocaleLowerCase("vi") === word.toLocaleLowerCase("vi")))
    .filter((item): item is FeaturedWord => Boolean(item));

  const selectedIds = new Set(selected.map((item) => item.id));
  const fallback = items.filter((item) => !selectedIds.has(item.id));
  return [...selected, ...fallback].slice(0, 8);
}

export function HomeTabs() {
  const router = useRouter();
  const [items, setItems] = useState<FeaturedWord[]>(() => vocabularyCourseData.map(toFeaturedWord));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFavorites(readFavorites());

    async function loadVocabulary() {
      if (!hasSupabaseEnv()) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("dictionary_words")
          .select("id, word, category, meaning, description, simple_explanation")
          .eq("status", "published")
          .limit(80);

        if (error) throw error;
        if (data && data.length > 0) {
          setItems(data.map((row) => toFeaturedWord(row as FeaturedWord)));
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Homepage vocabulary load error:", error);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadVocabulary();
  }, []);

  const previewItems = useMemo(() => pickFeaturedWords(items), [items]);

  function toggleFavorite(id: string) {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
    window.localStorage.setItem(favoriteKey, JSON.stringify(next));
    setFavorites(next);
  }

  return (
    <div className="mx-auto mt-6 grid max-w-7xl gap-6 sm:mt-8">
      <section className="rounded-[1.75rem] border border-blue-100 bg-white p-4 shadow-lg shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-blue-600 dark:text-blue-300">Bắt đầu nhanh</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Lối học chính</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickPaths.map((path) => (
            <Link
              key={path.href}
              href={path.href}
              className="group rounded-2xl border border-blue-100 bg-blue-50/60 p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800/80"
            >
              <path.icon className="h-6 w-6 text-blue-700 dark:text-blue-200" aria-hidden="true" />
              <h3 className="mt-3 font-black text-slate-950 dark:text-white">{path.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{path.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-blue-100 bg-white p-4 shadow-lg shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-blue-600 dark:text-blue-300">Gợi ý học nhanh</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Từ vựng nổi bật</h2>
          </div>
          <Button asChild className="w-full rounded-full sm:w-auto">
            <Link href="/khoa-hoc/tu-vung">Xem tất cả từ vựng</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" aria-hidden="true" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {previewItems.map((item) => {
              const isFavorite = favorites.includes(item.id);

              return (
                <article
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/khoa-hoc/tu-vung")}
                  onKeyDown={(event) => event.key === "Enter" && router.push("/khoa-hoc/tu-vung")}
                  className="cursor-pointer rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/30 transition hover:-translate-y-0.5 hover:border-blue-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-1 text-lg font-black text-slate-950 dark:text-white">{item.word}</h3>
                      <p className="mt-1 w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">{item.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-800 dark:text-blue-200"
                      aria-label={isFavorite ? `Bỏ lưu ${item.word}` : `Lưu ${item.word}`}
                    >
                      <Bookmark className={isFavorite ? "h-4 w-4 fill-blue-700" : "h-4 w-4"} aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
