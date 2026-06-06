"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bookmark, CheckCircle2, ExternalLink, HelpCircle, Info, MessageCircle, PlayCircle, Search, Sparkles, Video, X, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/common/SectionCard";
import { signCategories, signDictionaryData, signRegions, type SignDictionaryItem } from "@/data/signDictionaryData";
import { getDictionaryLetterId, groupDictionaryByLetter, normalizeVietnameseText, vietnameseAlphabet } from "@/lib/vietnameseText";
import { AIExplanation } from "@/components/dictionary/AIExplanation";
import { AskAIButton } from "@/components/dictionary/AskAIButton";
import { CommunityVideos } from "@/components/dictionary/CommunityVideos";
import { WordComments } from "@/components/dictionary/WordComments";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

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
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveUnique(key: string, id: string) {
  const current = readLocalArray(key);
  window.localStorage.setItem(key, JSON.stringify(Array.from(new Set([...current, id]))));
}

function scrollToLetter(letter: string) {
  document.getElementById(getDictionaryLetterId(letter))?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    async function loadData() {
      try {
        if (!hasSupabaseEnv()) {
          throw new Error("Missing Supabase env");
        }
        const supabase = createClient();
        const { data, error } = await supabase
          .from("dictionary_words")
          .select("*")
          .eq("status", "published");

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: SignDictionaryItem[] = data.map((row: any) => ({
            id: row.id,
            word: row.word,
            normalizedWord: row.normalized_word,
            firstLetter: row.first_letter,
            meaning: row.meaning,
            simpleExplanation: row.simple_explanation || undefined,
            category: row.category,
            region: row.region as any,
            difficulty: row.difficulty as any,
            exampleSentence: row.example_sentence,
            description: row.description || "",
            signSteps: row.sign_steps,
            gifUrl: row.gif_url || undefined,
            videoUrl: row.video_url || undefined,
            thumbnailUrl: row.thumbnail_url || undefined,
            sourceName: row.source_name || undefined,
            sourceUrl: row.source_url || undefined,
            relatedWords: row.related_words,
          }));
          setDictWords(mapped);
        } else {
          throw new Error("No data in DB");
        }
      } catch (err) {
        console.warn("Could not load dictionary from DB, checking dev fallback:", err);
        if (process.env.NODE_ENV === "development") {
          setDictWords(signDictionaryData);
        }
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
        const searchable = [
          item.word,
          item.normalizedWord,
          item.meaning,
          item.category,
          item.exampleSentence,
          item.description,
          ...item.relatedWords,
        ].map(normalizeVietnameseText).join(" ");
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        return matchesCategory && matchesRegion && matchesDifficulty && matchesQuery;
      })
      .sort((a, b) => a.normalizedWord.localeCompare(b.normalizedWord, "vi"));
  }, [dictWords, query, category, region, difficulty]);

  const grouped = useMemo(() => groupDictionaryByLetter(filtered), [filtered]);
  const lettersWithData = new Set(grouped.filter((group) => group.items.length).map((group) => group.letter));

  function toggleFavorite(id: string) {
    const current = readLocalArray(favoriteKey);
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    window.localStorage.setItem(favoriteKey, JSON.stringify(next));
    setFavoriteIds(next);
  }

  function markLearned(id: string) {
    saveUnique(learnedKey, id);
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">CHẠM</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl">Từ điển CHẠM</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Tra ký hiệu và hiểu nghĩa tiếng Việt theo cách dễ hiểu hơn.
          </p>
        </div>

        <SectionCard className="mb-6">
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-blue-100 bg-white px-4 py-2 shadow-lg shadow-blue-100/50 sm:rounded-full">
            <Search className="h-6 w-6 shrink-0 text-blue-500" aria-hidden="true" />
            <label className="sr-only" htmlFor="dictionary-search">Tìm kiếm từ điển</label>
            <input
              id="dictionary-search"
              value={query}
              onChange={(event) => setQuery(event.target.value.slice(0, 100))}
              placeholder="Nhập từ bạn muốn học hoặc muốn hiểu nghĩa..."
              className="min-h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <FilterSelect label="Chủ đề" value={category} onChange={setCategory} options={["Tất cả", ...signCategories]} />
            <FilterSelect label="Khu vực" value={region} onChange={setRegion} options={["Tất cả", ...signRegions]} getLabel={(value) => value === "Tất cả" ? value : regionLabels[value as keyof typeof regionLabels]} />
            <FilterSelect label="Độ khó" value={difficulty} onChange={setDifficulty} options={["Tất cả", "easy", "medium", "hard"]} getLabel={(value) => value === "Tất cả" ? value : difficultyLabels[value as keyof typeof difficultyLabels]} />
          </div>

          <div className="sticky top-24 z-20 mt-5 flex gap-2 overflow-x-auto rounded-full bg-white/95 py-2 lg:hidden">
            {vietnameseAlphabet.map((letter) => (
              <button key={letter} type="button" disabled={!lettersWithData.has(letter)} onClick={() => scrollToLetter(letter)} className={`h-9 min-w-9 rounded-full text-sm font-black ${lettersWithData.has(letter) ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-300"}`}>
                {letter}
              </button>
            ))}
          </div>

          <p className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-900 flex items-start gap-2">
            <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <span>Dữ liệu ký hiệu trong từ điển là nội dung minh họa cho demo. Bạn có thể đóng góp video ký hiệu hoặc bình luận để làm phong phú từ điển nhé!</span>
          </p>
        </SectionCard>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <span className="font-bold text-slate-500">Đang tải dữ liệu từ điển...</span>
          </div>
        ) : query.trim() && filtered.length === 0 ? (
          /* Empty Search and AI explanation fallback */
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50 sm:p-8">
                <div className="flex items-center gap-2 text-blue-600">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-sm font-black uppercase">Tính năng AI hỗ trợ</span>
                </div>
                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  Chưa có ký hiệu cho &quot;{query}&quot;
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 sm:text-base">
                  Hệ thống chưa có ký hiệu chuẩn cho từ này. Bạn hãy đọc giải thích nghĩa từ AI hoặc tham gia làm giàu từ điển bằng cách đóng góp video ký hiệu nhé!
                </p>

                <div className="mt-6">
                  <AIExplanation word={query} hasSignData={false} />
                </div>
              </div>

              <div>
                <CommunityVideos wordId={normalizeVietnameseText(query)} wordText={query} />
              </div>
            </div>

            <div>
              <WordComments wordId={normalizeVietnameseText(query)} />
            </div>
          </div>
        ) : (
          /* Regular search list */
          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="space-y-10">
              {filtered.length ? grouped.map((group) => group.items.length ? (
                <section key={group.letter} id={getDictionaryLetterId(group.letter)} className="scroll-mt-36">
                  <h2 className="mb-4 flex items-center gap-3 text-3xl font-black text-blue-700 sm:text-4xl">
                    {group.letter}
                    <span className="h-px flex-1 bg-blue-100" />
                  </h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {group.items.map((item) => (
                      <DictionaryCard key={item.id} item={item} favorite={favoriteIds.includes(item.id)} onFavorite={() => toggleFavorite(item.id)} onOpen={() => setSelected(item)} />
                    ))}
                  </div>
                </section>
              ) : null) : (
                <div className="rounded-3xl bg-blue-50/50 p-8 text-center border border-blue-100">
                  <HelpCircle className="mx-auto h-12 w-12 text-blue-400" />
                  <p className="mt-4 text-lg font-bold text-blue-900">Hãy gõ từ bạn cần tìm ở ô tìm kiếm phía trên.</p>
                </div>
              )}
            </div>

            <aside className="sticky top-28 hidden h-fit rounded-full border border-blue-100 bg-white p-2 shadow-lg shadow-blue-100/60 lg:block" aria-label="Chỉ mục chữ cái">
              <div className="grid gap-1">
                {vietnameseAlphabet.map((letter) => (
                  <button key={letter} type="button" disabled={!lettersWithData.has(letter)} onClick={() => scrollToLetter(letter)} className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition ${lettersWithData.has(letter) ? "text-blue-700 hover:bg-blue-50" : "text-slate-300"}`}>
                    {letter}
                  </button>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>

      <SignDetailModal item={selected} onClose={() => setSelected(null)} onFavorite={toggleFavorite} onLearned={markLearned} />
    </main>
  );
}

export default function DictionaryPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center font-bold text-slate-500">Đang tải từ điển...</div>
      </main>
    }>
      <DictionaryContent />
    </Suspense>
  );
}


function FilterSelect({ label, value, onChange, options, getLabel }: { label: string; value: string; onChange: (value: string) => void; options: string[]; getLabel?: (value: string) => string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 rounded-2xl border border-blue-100 bg-white px-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100">
        {options.map((option) => <option key={option} value={option}>{getLabel ? getLabel(option) : option}</option>)}
      </select>
    </label>
  );
}

function DictionaryCard({ item, favorite, onFavorite, onOpen }: { item: SignDictionaryItem; favorite: boolean; onFavorite: () => void; onOpen: () => void }) {
  return (
    <article className="min-w-0 rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-lg shadow-blue-100/50 sm:rounded-[1.75rem] sm:p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="break-words text-2xl font-black text-slate-950">{item.word}</h3>
            <p className="mt-2 leading-7 text-slate-600">{item.meaning}</p>
          </div>
          <button type="button" onClick={onFavorite} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100" aria-label={favorite ? `Bỏ yêu thích ${item.word}` : `Lưu yêu thích ${item.word}`}>
            <Bookmark className={favorite ? "h-5 w-5 fill-blue-600" : "h-5 w-5"} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{item.category}</Badge>
          <Badge className="bg-sky-50 text-sky-800 ring-sky-100">{regionLabels[item.region as keyof typeof regionLabels] ?? item.region}</Badge>
          <Badge className="bg-emerald-50 text-emerald-800 ring-emerald-100">{difficultyLabels[item.difficulty]}</Badge>
        </div>
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 font-semibold text-slate-700">{item.exampleSentence}</p>
        <MediaRenderer videoUrl={item.videoUrl} gifUrl={item.gifUrl} />
      </div>
      <Button onClick={onOpen} className="mt-4 w-full rounded-full sm:w-auto self-start">Xem ký hiệu & Đóng góp</Button>
    </article>
  );
}

function MediaRenderer({ videoUrl, gifUrl }: { videoUrl?: string; gifUrl?: string }) {
  if (videoUrl) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-black aspect-video flex items-center justify-center">
        <video src={videoUrl} className="h-full w-full object-contain" controls loop muted autoPlay playsInline />
      </div>
    );
  }
  if (gifUrl) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-slate-100 aspect-video flex items-center justify-center">
        <img src={gifUrl} alt="Minh họa ký hiệu" className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4 text-blue-900">
      <div className="mb-2 flex items-center gap-2 font-black"><PlayCircle className="h-5 w-5" /> GIF/Video minh họa ký hiệu</div>
      <p className="text-sm leading-6">Nội dung minh họa sẽ được nhóm bổ sung hoặc xác minh ở giai đoạn sau.</p>
    </div>
  );
}

function SignDetailModal({ item, onClose, onFavorite, onLearned }: { item: SignDictionaryItem | null; onClose: () => void; onFavorite: (id: string) => void; onLearned: (id: string) => void }) {
  return (
    <Dialog.Root open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-1rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.5rem] bg-white p-4 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-[calc(100%-2rem)] sm:rounded-[2rem] sm:p-6">
          {item ? (
            <div className="grid gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="text-3xl font-black text-blue-700 sm:text-4xl">{item.word}</Dialog.Title>
                  <Dialog.Description className="mt-2 text-lg leading-8 text-slate-600">{item.meaning}</Dialog.Description>
                </div>
                <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"><X className="h-5 w-5" /></button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-6">
                  <MediaRenderer videoUrl={item.videoUrl} gifUrl={item.gifUrl} />
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge>{item.category}</Badge>
                    <Badge className="bg-sky-50 text-sky-800 ring-sky-100">{regionLabels[item.region as keyof typeof regionLabels] ?? item.region}</Badge>
                    <Badge className="bg-emerald-50 text-emerald-800 ring-emerald-100">{difficultyLabels[item.difficulty]}</Badge>
                  </div>
                  
                  <p className="rounded-2xl bg-slate-50 p-4 text-base font-semibold text-slate-800">{item.exampleSentence}</p>
                  
                  <div>
                    <h3 className="mb-3 text-xl font-black text-slate-950">Mô tả từng bước</h3>
                    <ol className="grid gap-2">
                      {item.signSteps.map((step, index) => <li key={step} className="rounded-2xl bg-blue-50 p-3 font-semibold text-blue-900">{index + 1}. {step}</li>)}
                    </ol>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-black text-slate-950">Từ liên quan</h3>
                    <div className="flex flex-wrap gap-2">{item.relatedWords.map((word) => <Badge key={word} className="bg-slate-100 text-slate-700 ring-slate-200">{word}</Badge>)}</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-bold text-slate-800">Nguồn: {item.sourceName ?? "Chưa xác định"}</p>
                    {item.sourceUrl ? <a className="mt-1 inline-flex items-center gap-1 font-bold text-blue-700" href={item.sourceUrl} target="_blank" rel="noreferrer">Xem nguồn <ExternalLink className="h-4 w-4" /></a> : null}
                  </div>
                  
                  <p className="rounded-2xl bg-orange-50 p-4 font-semibold leading-7 text-orange-900">Ký hiệu có thể khác nhau theo vùng. Nội dung trong bản demo cần được xác minh bởi giáo viên hoặc nguồn chuyên môn.</p>
                </div>

                <div className="space-y-6">
                  {/* AI Section */}
                  <div className="space-y-3">
                    <AIExplanation word={item.word} hasSignData={true} context={`Nghĩa: ${item.meaning}. Ví dụ: ${item.exampleSentence}`} />
                    <AskAIButton word={item.word} hasSignData={true} context={`Nghĩa: ${item.meaning}. Ví dụ: ${item.exampleSentence}`} />
                  </div>

                  {/* Community Video Upload Section */}
                  <CommunityVideos wordId={item.id} wordText={item.word} />

                  {/* Word Comments Section */}
                  <WordComments wordId={item.id} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Button variant="secondary" className="rounded-full" onClick={() => onFavorite(item.id)}><Bookmark className="h-5 w-5" /> Lưu yêu thích</Button>
                <Button variant="success" className="rounded-full" onClick={() => onLearned(item.id)}><CheckCircle2 className="h-5 w-5" /> Đánh dấu đã học</Button>
                <Button variant="outline" className="rounded-full" onClick={onClose}>Đóng</Button>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
