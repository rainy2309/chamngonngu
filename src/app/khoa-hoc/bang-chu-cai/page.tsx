"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Check, CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { learningStorageKeys, saveLearningItem } from "@/lib/localLearning";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

const learnedAlphabetKey = "cham_learned_alphabet";
const learnedSignsKey = "cham_learned_signs";
const favoriteSignsKey = "cham_favorite_signs";

function readStringArray(key: string) {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return String(record.id ?? record.label ?? "");
        }
        return "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function saveUniqueString(key: string, id: string) {
  if (typeof window === "undefined") return [];

  const next = Array.from(new Set([id, ...readStringArray(key)]));
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

function saveViewedCourse() {
  saveLearningItem(learningStorageKeys.viewedLessons, { id: "bang-chu-cai", label: "Ký hiệu bảng chữ cái" });
}

type AlphabetItem = {
  id: string;
  letter_key: string;
  letter: string;
  title: string;
  description: string | null;
  video_url: string | null;
  gif_url: string | null;
  thumbnail_url: string | null;
  instructions: string[];
  tips: string[];
  status: string;
  display_order: number;
};

// Media renderer that supports real video/gif URLs or falls back to placeholder
function MediaRenderer({ item }: { item: AlphabetItem }) {
  if (item.video_url) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[1.75rem] border border-blue-100 bg-black shadow-lg">
        <video
          src={item.video_url}
          className="h-full w-full object-contain"
          controls
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    );
  }

  if (item.gif_url) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[1.75rem] border border-blue-100 bg-slate-100 shadow-lg flex items-center justify-center">
        <img
          src={item.gif_url}
          alt={item.title}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-[1.75rem] border border-dashed border-blue-200 bg-blue-50 p-5 text-center text-blue-900 shadow-inner">
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <PlayCircle className="h-10 w-10 text-blue-600" aria-hidden="true" />
        <p className="text-base font-black sm:text-lg">GIF/Video minh họa chữ {item.letter}</p>
        <p className="max-w-md text-xs font-semibold leading-6 text-slate-500 sm:text-sm">Nội dung minh họa sẽ được nhóm bổ sung hoặc xác minh ở giai đoạn sau.</p>
      </div>
    </div>
  );
}

export default function AlphabetCoursePage() {
  const [alphabetList, setAlphabetList] = useState<AlphabetItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const detailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLearnedIds(readStringArray(learnedAlphabetKey));
    setFavoriteIds(readStringArray(favoriteSignsKey));
    saveViewedCourse();

    async function loadAlphabet() {
      if (hasSupabaseEnv()) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("alphabet_media")
          .select("*")
          .eq("status", "published")
          .order("display_order", { ascending: true })
          .order("letter", { ascending: true });

        if (data && data.length > 0) {
          setAlphabetList(data);
          setSelectedId(data[0].id);
        }
      }
      setLoading(false);
    }
    void loadAlphabet();
  }, []);

  const selectedIndex = useMemo(() => alphabetList.findIndex((item) => item.id === selectedId), [selectedId, alphabetList]);
  const selectedItem = useMemo(() => alphabetList[selectedIndex] ?? alphabetList[0], [selectedIndex, alphabetList]);
  const totalLetters = alphabetList.length;

  function selectLetter(id: string, shouldScroll = true) {
    setSelectedId(id);
    if (shouldScroll) {
      window.setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

  function markLearned() {
    if (!selectedItem) return;
    const next = saveUniqueString(learnedAlphabetKey, selectedItem.id);
    saveUniqueString(learnedSignsKey, `alphabet-${selectedItem.id}`);
    setLearnedIds(next);
  }

  function saveFavorite() {
    if (!selectedItem) return;
    const next = saveUniqueString(favoriteSignsKey, selectedItem.id);
    setFavoriteIds(next);
  }

  function goToIndex(index: number) {
    const next = alphabetList[index];
    if (next) selectLetter(next.id);
  }

  if (loading) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="font-semibold text-slate-500">Đang tải dữ liệu bảng chữ cái...</p>
        </div>
      </main>
    );
  }

  if (!alphabetList.length) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-blue-100 bg-white p-12 text-center font-bold text-slate-700 shadow-xl shadow-blue-100/60 space-y-4">
          <p className="text-lg text-slate-800">Chưa có dữ liệu bảng chữ cái trong cơ sở dữ liệu.</p>
          <p className="text-sm font-medium text-slate-500">Vui lòng truy cập trang Quản trị và seed dữ liệu hoặc thêm thủ công.</p>
          <div className="pt-4">
            <a href="/admin/seed" className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition">
              Đi đến Seed Dữ liệu
            </a>
          </div>
        </div>
      </main>
    );
  }

  const selectedIsLearned = learnedIds.includes(selectedItem?.id);
  const selectedIsFavorite = favoriteIds.includes(selectedItem?.id);

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-5 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/60 sm:p-7 lg:grid-cols-[1.4fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-blue-600">Khóa học</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl">Ký hiệu bảng chữ cái</h1>
            <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-slate-600 sm:text-lg sm:leading-8">Chọn một chữ cái để xem minh họa ký hiệu, cách thực hiện và ghi chú học tập.</p>
          </div>
          <div className="rounded-[1.5rem] bg-blue-50 px-5 py-4 text-blue-900">
            <p className="text-sm font-black uppercase">Tiến độ</p>
            <p className="mt-1 text-2xl font-black">Đã học: {learnedIds.length} / {totalLetters} chữ</p>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-blue-100 bg-white p-4 shadow-lg shadow-blue-100/50 sm:p-5">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0" aria-label="Chọn chữ cái">
            {alphabetList.map((item) => {
              const active = item.id === selectedItem?.id;
              const learned = learnedIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Xem ký hiệu chữ ${item.letter}`}
                  aria-pressed={active}
                  onClick={() => selectLetter(item.id)}
                  className={`relative flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border px-4 text-base font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                    active ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100" : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  {item.letter}
                  {learned ? (
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-white" aria-label="Đã học">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {selectedItem && (
          <div ref={detailRef} className="scroll-mt-28">
            <section className="mt-6 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/60 sm:p-7">
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-7xl font-black leading-none text-blue-700 sm:text-8xl">{selectedItem.letter}</p>
                      <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">{selectedItem.title}</h2>
                    </div>
                    {selectedIsLearned ? <CheckCircle2 className="h-9 w-9 shrink-0 text-emerald-600" aria-label="Đã học" /> : null}
                  </div>
                  <MediaRenderer item={selectedItem} />
                </div>

                <div className="grid gap-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Bảng chữ cái</Badge>
                    <Badge className="bg-emerald-50 text-emerald-800 ring-emerald-100">Cơ bản</Badge>
                    {selectedIsFavorite ? <Badge className="bg-orange-50 text-orange-800 ring-orange-100">Đã lưu yêu thích</Badge> : null}
                  </div>

                  {selectedItem.description && (
                    <section>
                      <h3 className="text-xl font-black text-slate-950">Mô tả ngắn</h3>
                      <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700 sm:text-base">{selectedItem.description}</p>
                    </section>
                  )}

                  {selectedItem.instructions && selectedItem.instructions.length > 0 && (
                    <section>
                      <h3 className="text-xl font-black text-slate-950">Cách thực hiện</h3>
                      <ul className="mt-3 grid gap-2">
                        {selectedItem.instructions.map((instruction, idx) => (
                          <li key={idx} className="rounded-2xl bg-blue-50 p-3 text-sm font-semibold leading-6 text-blue-900 sm:text-base">
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {selectedItem.tips && selectedItem.tips.length > 0 && (
                    <section>
                      <h3 className="text-xl font-black text-slate-950">Lưu ý khi học</h3>
                      <ul className="mt-3 grid gap-2">
                        {selectedItem.tips.map((tip, idx) => (
                          <li key={idx} className="rounded-2xl bg-orange-50 p-3 text-sm font-semibold leading-6 text-orange-900 sm:text-base">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button className="w-full rounded-full" onClick={markLearned}>
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      Đánh dấu đã học
                    </Button>
                    <Button variant="secondary" className="w-full rounded-full" onClick={saveFavorite}>
                      <Bookmark className={selectedIsFavorite ? "h-5 w-5 fill-blue-700" : "h-5 w-5"} aria-hidden="true" />
                      Lưu yêu thích
                    </Button>
                    <Button variant="outline" className="w-full rounded-full" disabled={selectedIndex <= 0} onClick={() => goToIndex(selectedIndex - 1)}>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      Chữ trước
                    </Button>
                    <Button variant="outline" className="w-full rounded-full" disabled={selectedIndex >= totalLetters - 1} onClick={() => goToIndex(selectedIndex + 1)}>
                      Chữ tiếp theo
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
