"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Bookmark, Check, CheckCircle2, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { alphabetSignData, type AlphabetSignItem } from "@/data/alphabetSignData";
import { learningStorageKeys, saveLearningItem } from "@/lib/localLearning";

const learnedAlphabetKey = "cham_learned_alphabet";
const favoriteSignsKey = "cham_favorite_signs";

const compactInstructions = [
  "Quan sát hình minh họa.",
  "Giữ tay trong khung nhìn rõ.",
  "Thực hiện chậm và lặp lại 3-5 lần.",
];

const compactTips = [
  "Không thực hiện quá nhanh khi mới học.",
  "Nội dung demo cần được xác minh bởi nguồn chuyên môn.",
];

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

function ImageBox({ item, compact = false }: { item: AlphabetSignItem; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const canShowImage = Boolean(item.image && !failed);

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-blue-200 bg-blue-50 text-blue-800 ${
        compact ? "h-[54px] min-[390px]:h-16 sm:h-[68px]" : "aspect-[4/3] min-h-32"
      }`}
    >
      {canShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={`Minh họa ${item.label}`} className="h-full w-full object-contain p-1.5" onError={() => setFailed(true)} />
      ) : (
        <div className="grid place-items-center gap-1 text-center">
          <ImageIcon className={compact ? "h-5 w-5" : "h-9 w-9"} aria-hidden="true" />
          <span className="text-[11px] font-black sm:text-xs">Minh họa</span>
        </div>
      )}
    </div>
  );
}

function BoardCell({ item, learned, onClick }: { item: AlphabetSignItem; learned: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Xem ${item.title.toLowerCase()}`}
      className="group min-h-[105px] rounded-[14px] border border-blue-100 bg-white p-1.5 text-center shadow-sm shadow-blue-100/40 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 min-[390px]:min-h-[112px] sm:min-h-[122px] sm:p-2"
    >
      <div className="relative">
        <ImageBox item={item} compact />
        {learned ? (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-white" aria-label="Đã học">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <span className="mt-1.5 block truncate text-xs font-black leading-5 text-slate-900 group-hover:text-blue-700 sm:text-sm">{item.label}</span>
      <span className="block text-[10px] font-bold text-slate-500">{item.type === "letter" ? "Chữ cái" : "Dấu"}</span>
    </button>
  );
}

function DetailModal({
  item,
  learned,
  favorite,
  onOpenChange,
  onLearned,
  onFavorite,
}: {
  item: AlphabetSignItem | null;
  learned: boolean;
  favorite: boolean;
  onOpenChange: (open: boolean) => void;
  onLearned: () => void;
  onFavorite: () => void;
}) {
  return (
    <Dialog.Root open={Boolean(item)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="scrollbar-hide fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[calc(100vw-24px)] max-w-[900px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.5rem] bg-white p-4 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 sm:p-5 lg:max-h-[80vh]">
          {item ? (
            <div className="grid gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-4xl font-black leading-none text-blue-700 sm:text-5xl">{item.label}</p>
                  <Dialog.Title className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{item.title}</Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100" aria-label="Đóng">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
                <ImageBox item={item} />

                <div className="grid gap-3">
                  <section>
                    <h3 className="text-base font-black text-slate-950">Mô tả ngắn</h3>
                    <p className="mt-1.5 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">{item.shortDescription}</p>
                  </section>

                  <section>
                    <h3 className="text-base font-black text-slate-950">Cách thực hiện</h3>
                    <ul className="mt-1.5 grid gap-1.5">
                      {compactInstructions.map((instruction) => (
                        <li key={instruction} className="rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-900">
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-base font-black text-slate-950">Lưu ý khi học</h3>
                    <ul className="mt-1.5 grid gap-1.5">
                      {compactTips.map((tip) => (
                        <li key={tip} className="rounded-2xl bg-orange-50 px-3 py-2 text-sm font-semibold leading-6 text-orange-900">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>

              <div className="grid gap-2 border-t border-blue-100 pt-3 sm:grid-cols-3">
                <Button className="w-full rounded-full" onClick={onLearned}>
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  {learned ? "Đã học" : "Đánh dấu đã học"}
                </Button>
                <Button variant="secondary" className="w-full rounded-full" onClick={onFavorite}>
                  <Bookmark className={favorite ? "h-5 w-5 fill-blue-700" : "h-5 w-5"} aria-hidden="true" />
                  {favorite ? "Đã lưu yêu thích" : "Lưu yêu thích"}
                </Button>
                <Dialog.Close asChild>
                  <Button variant="outline" className="w-full rounded-full">
                    Đóng
                  </Button>
                </Dialog.Close>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function AlphabetCoursePage() {
  const [selectedItem, setSelectedItem] = useState<AlphabetSignItem | null>(null);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setLearnedIds(readStringArray(learnedAlphabetKey));
    setFavoriteIds(readStringArray(favoriteSignsKey));
    saveViewedCourse();
  }, []);

  function markLearned() {
    if (!selectedItem) return;
    setLearnedIds(saveUniqueString(learnedAlphabetKey, selectedItem.id));
  }

  function saveFavorite() {
    if (!selectedItem) return;
    setFavoriteIds(saveUniqueString(favoriteSignsKey, selectedItem.id));
  }

  const totalItems = alphabetSignData.length;
  const selectedIsLearned = selectedItem ? learnedIds.includes(selectedItem.id) : false;
  const selectedIsFavorite = selectedItem ? favoriteIds.includes(selectedItem.id) : false;

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 pb-8 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <section className="mx-auto grid max-w-[1360px] gap-4 lg:grid-cols-[280px_1fr] lg:items-start xl:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg shadow-blue-100/50 lg:sticky lg:top-28">
          <p className="text-xs font-black uppercase text-blue-600">KHÓA HỌC</p>
          <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950">Ký hiệu bảng chữ cái</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Chọn một chữ cái hoặc dấu để xem minh họa ký hiệu.</p>

          <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-blue-900">
            <p className="text-xs font-black uppercase">Tiến độ</p>
            <p className="mt-1 text-xl font-black">Đã học: {learnedIds.length} / {totalItems} mục</p>
          </div>

          <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600">Mỗi ô gồm chữ/dấu và minh họa ký hiệu. Nhấn vào ô để xem chi tiết.</p>
        </aside>

        <div className="rounded-2xl border border-blue-100 bg-white p-3 shadow-lg shadow-blue-100/40 sm:p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Bảng chữ cái và dấu</h2>
              <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">Nhấn vào từng ô để mở phần học chi tiết.</p>
            </div>
            <p className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800 sm:text-sm">{totalItems} mục học</p>
          </div>

          <div className="grid grid-cols-3 gap-2 min-[390px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8">
            {alphabetSignData.map((item) => (
              <BoardCell key={item.id} item={item} learned={learnedIds.includes(item.id)} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        </div>
      </section>

      <DetailModal
        item={selectedItem}
        learned={selectedIsLearned}
        favorite={selectedIsFavorite}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        onLearned={markLearned}
        onFavorite={saveFavorite}
      />
    </main>
  );
}
