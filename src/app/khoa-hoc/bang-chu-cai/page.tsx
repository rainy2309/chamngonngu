"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Bookmark, Check, CheckCircle2, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { alphabetSignData, type AlphabetItemType, type AlphabetSignItem } from "@/data/alphabetSignData";
import { learningStorageKeys, saveLearningItem } from "@/lib/localLearning";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const learnedAlphabetKey = "cham_learned_alphabet";
const favoriteSignsKey = "cham_favorite_signs";

type BoardAlphabetItem = AlphabetSignItem & {
  media_id?: string | null;
  board_image_url?: string | null;
  board_image_alt?: string | null;
  video_url?: string | null;
  gif_url?: string | null;
  thumbnail_url?: string | null;
};

const compactInstructions = [
  "Quan sát hình minh họa.",
  "Giữ tay trong khung nhìn rõ.",
  "Thực hiện chậm và lặp lại 3-5 lần.",
];

const compactTips = [
  "Không thực hiện quá nhanh khi mới học.",
  "Nội dung demo cần được xác minh bởi nguồn chuyên môn.",
];

const alphabetSections: Array<{ title: string; description: string; type: AlphabetItemType }> = [
  {
    title: "Chữ cái cơ bản",
    description: "Các ký hiệu chữ cái gốc trong bảng minh họa.",
    type: "letter",
  },
  {
    title: "Biến thể nguyên âm",
    description: "Các ô quy tắc kết hợp nguyên âm với dấu phụ trong biểu đồ.",
    type: "vowel_modifier",
  },
  {
    title: "Dấu thanh",
    description: "Các dấu thanh được học như nhóm ký hiệu riêng.",
    type: "tone_mark",
  },
];

function getTypeLabel(type: AlphabetItemType) {
  if (type === "letter") return "Chữ cái";
  if (type === "vowel_modifier") return "Biến thể nguyên âm";
  return "Dấu thanh";
}

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

function toggleUniqueString(key: string, id: string) {
  if (typeof window === "undefined") return [];

  const current = readStringArray(key);
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

function saveViewedCourse() {
  saveLearningItem(learningStorageKeys.viewedLessons, { id: "bang-chu-cai", label: "Ký hiệu bảng chữ cái" });
}

function ImageBox({ item }: { item: AlphabetSignItem }) {
  const [failed, setFailed] = useState(false);
  const canShowImage = Boolean(item.image && !failed);

  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-blue-200 bg-blue-50 text-blue-800 aspect-[4/3] min-h-32">
      {canShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={`Minh họa ${item.label}`} className="h-full w-full object-contain p-1.5" onError={() => setFailed(true)} />
      ) : (
        <div className="grid place-items-center gap-1 text-center">
          <ImageIcon className="h-9 w-9" aria-hidden="true" />
          <span className="text-xs font-black">Minh họa</span>
        </div>
      )}
    </div>
  );
}

function DetailMediaBox({ item }: { item: BoardAlphabetItem }) {
  const [failed, setFailed] = useState(false);

  if (item.video_url) {
    return (
      <div className="flex aspect-[4/3] min-h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950">
        <video
          src={item.video_url}
          poster={item.thumbnail_url ?? undefined}
          controls
          preload="metadata"
          className="max-h-[260px] w-full rounded-xl object-contain sm:max-h-[320px] lg:max-h-[360px]"
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>
    );
  }

  if (item.gif_url && !failed) {
    return (
      <div className="flex aspect-[4/3] min-h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-blue-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.gif_url}
          alt={`GIF minh họa ${item.display_label}`}
          className="max-h-[260px] w-full rounded-xl object-contain sm:max-h-[320px] lg:max-h-[360px]"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  if (item.thumbnail_url && !failed) {
    return (
      <div className="flex aspect-[4/3] min-h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-blue-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnail_url}
          alt={`Ảnh minh họa ${item.display_label}`}
          className="max-h-[260px] w-full rounded-xl object-contain sm:max-h-[320px] lg:max-h-[360px]"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return <ImageBox item={item} />;
}

function BoardPreviewBox({ item }: { item: BoardAlphabetItem }) {
  const [failed, setFailed] = useState(false);
  const canShowBoardImage = Boolean(item.board_image_url && !failed);
  const isVowelModifier = item.type === "vowel_modifier";

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-white text-blue-800 dark:bg-slate-900 dark:text-blue-100",
        isVowelModifier ? "h-24 min-[390px]:h-28 sm:h-32 lg:h-32" : "h-20 min-[390px]:h-24 sm:h-28 lg:h-32",
      )}
    >
      {canShowBoardImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.board_image_url ?? ""}
          alt={item.board_image_alt || `Minh họa ${item.display_label}`}
          className={cn(
            "w-full object-contain px-1 py-1",
            isVowelModifier ? "max-h-[86px] min-[390px]:max-h-[100px] sm:max-h-[112px] lg:max-h-[118px]" : "max-h-[72px] min-[390px]:max-h-[84px] sm:max-h-[100px] lg:max-h-[112px]",
          )}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center rounded-xl bg-slate-50/80 text-center dark:bg-slate-800">
          <div className="grid place-items-center gap-1">
            <ImageIcon className="h-6 w-6 text-blue-300 sm:h-7 sm:w-7" aria-hidden="true" />
            <span className="text-[11px] font-black text-blue-700 dark:text-blue-100 sm:text-xs">Minh họa</span>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardCell({ item, learned, favorite, onClick }: { item: BoardAlphabetItem; learned: boolean; favorite: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Xem ${item.title.toLowerCase()}`}
      className={cn(
        "group rounded-[14px] border bg-white p-2 text-center shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-900 dark:focus-visible:ring-blue-500/30",
        item.type === "vowel_modifier" ? "min-h-[158px] min-[390px]:min-h-[174px] sm:min-h-[190px] sm:p-2.5 lg:min-h-[194px]" : "min-h-[132px] min-[390px]:min-h-[144px] sm:min-h-[166px] sm:p-2.5 lg:min-h-[182px]",
        learned
          ? "border-emerald-300 bg-emerald-50/70 shadow-emerald-100/70 hover:border-emerald-400 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:shadow-none"
          : "border-blue-100 shadow-blue-100/40 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:shadow-none dark:hover:border-blue-500/60 dark:hover:bg-blue-500/10",
        favorite && !learned ? "border-amber-200 bg-amber-50/50 shadow-amber-100/60 dark:border-amber-500/50 dark:bg-amber-500/10 dark:shadow-none" : "",
      )}
    >
      <div className="relative">
        <BoardPreviewBox item={item} />
        {learned ? (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-white" aria-label="Đã học">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
        ) : null}
        {favorite ? (
          <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-white ring-2 ring-white" aria-label="Đã lưu yêu thích">
            <Bookmark className="h-3 w-3 fill-current" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <div className={cn("flex min-h-5 flex-wrap justify-center gap-1", item.type === "vowel_modifier" ? "mt-1.5" : "mt-2")}>
        {learned ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">Đã học</span> : null}
        {favorite ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">Đã lưu</span> : null}
      </div>
      <span
        className={cn(
          "block text-sm font-black leading-5 text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-100 sm:text-base",
          item.type === "vowel_modifier" ? "mt-0.5" : "mt-1",
          item.type === "vowel_modifier" ? "whitespace-normal break-words" : "truncate",
        )}
      >
        {item.display_label}
      </span>
      <span className="mt-0.5 block text-[10px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">{getTypeLabel(item.type)}</span>
    </button>
  );
}

function getAlphabetProgressKeys(item: BoardAlphabetItem) {
  return [item.letter_key, item.id, item.label, item.display_label, `alphabet-${item.letter_key}`, `alphabet-${item.id}`].filter(Boolean);
}

function hasAlphabetProgress(ids: string[], item: BoardAlphabetItem) {
  const keys = getAlphabetProgressKeys(item);
  return ids.some((id) => keys.includes(id));
}

function getBoardItemId(letterKey: string) {
  return `alphabet-${letterKey}`;
}

function DetailModal({
  item,
  learned,
  favorite,
  onOpenChange,
  onLearned,
  onFavorite,
}: {
  item: BoardAlphabetItem | null;
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
                  <p className="text-4xl font-black leading-none text-blue-700 sm:text-5xl">{item.display_label}</p>
                  <Dialog.Title className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{item.title}</Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100" aria-label="Đóng">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
                <DetailMediaBox item={item} />

                <div className="grid gap-3">
                  <section>
                    <h3 className="text-base font-black text-slate-950">Mô tả ngắn</h3>
                    <p className="mt-1.5 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">{item.shortDescription}</p>
                  </section>

                  {item.explanation ? (
                    <section>
                      <h3 className="text-base font-black text-slate-950">Quy tắc / giải thích</h3>
                      <p className="mt-1.5 rounded-2xl bg-blue-50 p-3 text-sm font-semibold leading-6 text-blue-900">{item.explanation}</p>
                    </section>
                  ) : null}

                  <section>
                    <h3 className="text-base font-black text-slate-950">Cách thực hiện</h3>
                    <ul className="mt-1.5 grid gap-1.5">
                      {(item.instructions.length ? item.instructions : compactInstructions).slice(0, 4).map((instruction) => (
                        <li key={instruction} className="rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-900">
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-base font-black text-slate-950">Lưu ý khi học</h3>
                    <ul className="mt-1.5 grid gap-1.5">
                      {(item.tips.length ? item.tips : compactTips).slice(0, 3).map((tip) => (
                        <li key={tip} className="rounded-2xl bg-orange-50 px-3 py-2 text-sm font-semibold leading-6 text-orange-900">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>

              <div className="grid gap-2 border-t border-blue-100 pt-3 sm:grid-cols-3">
                <Button variant={learned ? "success" : "secondary"} className="w-full rounded-full" onClick={onLearned} aria-label={learned ? "Bấm để gỡ đã học" : "Đánh dấu đã học"} title={learned ? "Bấm để gỡ đã học" : "Đánh dấu đã học"}>
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  {learned ? "Đã học" : "Đánh dấu đã học"}
                </Button>
                <Button variant={favorite ? "default" : "secondary"} className={cn("w-full rounded-full", favorite ? "bg-amber-500 text-white hover:bg-amber-600" : "")} onClick={onFavorite} aria-label={favorite ? "Bấm để gỡ yêu thích" : "Lưu yêu thích"} title={favorite ? "Bấm để gỡ yêu thích" : "Lưu yêu thích"}>
                  <Bookmark className={favorite ? "h-5 w-5 fill-current" : "h-5 w-5"} aria-hidden="true" />
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
  const [items, setItems] = useState<BoardAlphabetItem[]>(alphabetSignData);
  const [selectedItem, setSelectedItem] = useState<BoardAlphabetItem | null>(null);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setLearnedIds(readStringArray(learnedAlphabetKey));
    setFavoriteIds(readStringArray(favoriteSignsKey));
    saveViewedCourse();

    async function loadBoardImages() {
      if (!hasSupabaseEnv()) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("alphabet_media")
          .select(
            "id, letter_key, letter, display_label, type, title, description, explanation, instructions, tips, video_url, gif_url, thumbnail_url, board_image_url, board_image_alt, status, display_order, updated_at",
          )
          .eq("status", "published");

        if (error) {
          console.error("Alphabet board image load error:", error);
          return;
        }

        const imageByKey = new Map(
          (data ?? []).map((row) => [
            String(row.letter_key),
            {
              media_id: row.id as string | null,
              letter: typeof row.letter === "string" ? row.letter : undefined,
              label: typeof row.display_label === "string" ? row.display_label : undefined,
              display_label: typeof row.display_label === "string" ? row.display_label : undefined,
              type: row.type as AlphabetItemType,
              title: typeof row.title === "string" ? row.title : undefined,
              shortDescription: typeof row.description === "string" ? row.description : undefined,
              description: typeof row.description === "string" ? row.description : undefined,
              explanation: typeof row.explanation === "string" ? row.explanation : undefined,
              instructions: Array.isArray(row.instructions) ? (row.instructions as string[]) : undefined,
              tips: Array.isArray(row.tips) ? (row.tips as string[]) : undefined,
              status: row.status as AlphabetSignItem["status"],
              display_order: typeof row.display_order === "number" ? row.display_order : undefined,
              video_url: row.video_url as string | null,
              gif_url: row.gif_url as string | null,
              thumbnail_url: row.thumbnail_url as string | null,
              board_image_url: row.board_image_url
                ? `${row.board_image_url}?t=${row.updated_at ? new Date(row.updated_at).getTime() : Date.now()}`
                : null,
              board_image_alt: row.board_image_alt as string | null,
            },
          ]),
        );

        setItems(
          alphabetSignData.map((item) => ({
            ...item,
            ...imageByKey.get(item.letter_key),
          })),
        );
      } catch (error) {
        console.error("Alphabet board image load error:", error);
      }
    }

    loadBoardImages();
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !selectedItem) return;
    console.log("Selected alphabet item:", selectedItem.letter_key, selectedItem);
    console.log("Selected alphabet video_url:", selectedItem.video_url);
  }, [selectedItem]);

  function markLearned() {
    if (!selectedItem) return;
    setLearnedIds(toggleUniqueString(learnedAlphabetKey, selectedItem.letter_key));
  }

  function saveFavorite() {
    if (!selectedItem) return;
    setFavoriteIds(toggleUniqueString(favoriteSignsKey, selectedItem.letter_key));
  }

  const activeItems = useMemo(
    () => items.filter((item) => item.status === "published").sort((a, b) => a.display_order - b.display_order),
    [items],
  );
  const totalItems = activeItems.length;
  const learnedActiveCount = activeItems.filter((item) => hasAlphabetProgress(learnedIds, item)).length;
  const selectedIsLearned = selectedItem ? hasAlphabetProgress(learnedIds, selectedItem) : false;
  const selectedIsFavorite = selectedItem ? hasAlphabetProgress(favoriteIds, selectedItem) : false;

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 pb-8 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <section className="mx-auto grid max-w-[1360px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg shadow-blue-100/50 lg:sticky lg:top-28">
          <p className="text-xs font-black uppercase text-blue-600">KHÓA HỌC</p>
          <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950">Ký hiệu bảng chữ cái</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Chọn một chữ cái hoặc nhóm dấu trong biểu đồ để xem minh họa ký hiệu.</p>

          <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-blue-900">
            <p className="text-xs font-black uppercase">Tiến độ</p>
            <p className="mt-1 text-xl font-black">
              Đã học: {learnedActiveCount} / {totalItems} mục
            </p>
          </div>

          <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600">
            Bảng học theo cấu trúc biểu đồ: chữ cái cơ bản, biến thể nguyên âm và dấu thanh.
          </p>
        </aside>

        <div className="rounded-2xl border border-blue-100 bg-white p-3 shadow-lg shadow-blue-100/40 sm:p-4">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Bảng ký hiệu theo biểu đồ</h2>
              <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">Nhấn vào từng ô để mở phần học chi tiết.</p>
            </div>
            <p className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800 sm:text-sm">{totalItems} mục học</p>
          </div>

          <div className="grid gap-6">
            {alphabetSections.map((section) => {
              const sectionItems = activeItems.filter((item) => item.type === section.type);

              return (
                <section key={section.type} className="grid gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{section.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{section.description}</p>
                  </div>
                  <div className={cn("grid gap-3", section.type === "vowel_modifier" ? "mx-auto w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 min-[390px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-7")}>
                    {sectionItems.map((item) => (
                      <div key={item.letter_key} id={getBoardItemId(item.letter_key)} className="min-w-0 scroll-mt-28">
                        <BoardCell item={item} learned={hasAlphabetProgress(learnedIds, item)} favorite={hasAlphabetProgress(favoriteIds, item)} onClick={() => setSelectedItem(item)} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
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
