"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, Brain, ImageIcon, Loader2, RotateCcw, Sparkles, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { alphabetSignData } from "@/data/alphabetSignData";
import { vocabularyCourseData } from "@/data/vocabularyCourseData";
import { learningStorageKeys, readLearningItems } from "@/lib/localLearning";
import { readPracticeStats, savePracticeAttempt, type PracticeStats } from "@/lib/practiceStats";
import { getProgressDisplayInfo } from "@/lib/progressDisplay";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { normalizeVietnameseText } from "@/lib/vietnameseText";

type Mode = "quick" | "topic";
type MediaKind = "video" | "gif" | "image";

type PracticeItem = {
  id: string;
  keys: string[];
  word: string;
  category: string;
  description: string;
  mediaUrl?: string;
  mediaKind?: MediaKind;
};

type QuizQuestion = {
  item: PracticeItem;
  options: string[];
  answer: string;
};

const questionCounts = [10, 20, 30];
const topicOptions = ["Chào hỏi", "Gia đình", "Bạn bè", "Học tập", "Nghề nghiệp", "Cảm xúc", "Ăn uống", "Di chuyển", "Hỏi đáp", "Khẩn cấp"];

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function getMedia(video?: string | null, gif?: string | null, thumbnail?: string | null, boardImage?: string | null) {
  if (video) return { mediaUrl: video, mediaKind: "video" as const };
  if (gif) return { mediaUrl: gif, mediaKind: "gif" as const };
  if (thumbnail) return { mediaUrl: thumbnail, mediaKind: "image" as const };
  if (boardImage) return { mediaUrl: boardImage, mediaKind: "image" as const };
  return {};
}

function getLocalIds(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return String(record.id ?? record.itemId ?? record.word_key ?? record.wordKey ?? record.label ?? "");
        }
        return "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function makeStaticVocabularyItems(): PracticeItem[] {
  return vocabularyCourseData.map((item) => {
    const media = getMedia(item.video_url, item.gif_url, item.thumbnail_url);
    return {
      id: item.id,
      keys: [item.id, item.word_key, normalizeVietnameseText(item.word), item.word].filter(Boolean),
      word: item.word,
      category: item.category,
      description: item.simple_explanation || item.description,
      ...media,
    };
  });
}

function makeStaticAlphabetItems(): PracticeItem[] {
  return alphabetSignData.map((item) => ({
    id: item.letter_key,
    keys: [item.id, item.letter_key, `alphabet-${item.letter_key}`, item.label, item.display_label].filter(Boolean),
    word: item.display_label || item.label,
    category: item.type === "tone_mark" ? "Dấu thanh" : "Bảng chữ cái",
    description: item.shortDescription || item.description,
    ...getMedia(null, null, null, item.image),
  }));
}

function hasAnyKey(item: PracticeItem, ids: string[]) {
  const normalizedIds = new Set(ids.flatMap((id) => [id, normalizeVietnameseText(id)]));
  return item.keys.some((key) => normalizedIds.has(key) || normalizedIds.has(normalizeVietnameseText(key)));
}

function makeQuestions(source: PracticeItem[], count: number): QuizQuestion[] {
  const selected = shuffle(source).slice(0, count);
  const allLabels = uniqueStrings(source.map((item) => item.word));

  return selected.map((item) => {
    const distractors = shuffle(allLabels.filter((label) => label !== item.word)).slice(0, 3);
    return {
      item,
      answer: item.word,
      options: shuffle(uniqueStrings([item.word, ...distractors])).slice(0, 4),
    };
  });
}

function isQuizValid(questions: QuizQuestion[]) {
  return questions.length > 0 && questions.every((question) => question.options.length === 4 && question.options.includes(question.answer));
}

function MediaQuestion({ item }: { item: PracticeItem }) {
  if (item.mediaUrl && item.mediaKind === "video") {
    return (
      <div className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-slate-950 sm:h-[300px]">
        <video src={item.mediaUrl} controls preload="metadata" className="h-full w-full object-contain" />
      </div>
    );
  }

  if (item.mediaUrl) {
    return (
      <div className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-blue-50 dark:bg-slate-800 sm:h-[300px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.mediaUrl} alt={`Minh họa ký hiệu cho ${item.word}`} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="grid h-[220px] place-items-center rounded-[1.5rem] bg-blue-50 text-center text-blue-700 dark:bg-slate-800 dark:text-blue-100 sm:h-[300px]">
      <div className="grid place-items-center gap-2">
        <ImageIcon className="h-8 w-8" aria-hidden="true" />
        <p className="font-black">Chưa có minh họa phù hợp</p>
      </div>
    </div>
  );
}

export default function PracticePage() {
  const [mode, setMode] = useState<Mode>("quick");
  const [selectedTopic, setSelectedTopic] = useState(topicOptions[0]);
  const [questionCount, setQuestionCount] = useState(10);
  const [allItems, setAllItems] = useState<PracticeItem[]>([]);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PracticeStats>(() => readPracticeStats());

  useEffect(() => {
    const learned = [
      ...readLearningItems(learningStorageKeys.learned).map((item) => item.id),
      ...getLocalIds("cham_learned_alphabet"),
    ];
    setLearnedIds(uniqueStrings(learned));

    async function loadPracticeItems() {
      const fallbackItems = [...makeStaticVocabularyItems(), ...makeStaticAlphabetItems()];
      if (!hasSupabaseEnv()) {
        setAllItems(fallbackItems);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const [{ data: words, error: wordError }, { data: alphabetRows, error: alphabetError }] = await Promise.all([
          supabase
            .from("dictionary_words")
            .select("id, word_key, word, normalized_word, category, description, simple_explanation, video_url, gif_url, thumbnail_url")
            .eq("status", "published"),
          supabase
            .from("alphabet_media")
            .select("id, letter_key, label, display_label, type, title, description, explanation, video_url, gif_url, thumbnail_url, board_image_url, status, updated_at")
            .eq("status", "published"),
        ]);

        if (wordError) throw wordError;
        if (alphabetError) throw alphabetError;

        const wordItems: PracticeItem[] = (words ?? []).map((row: any) => ({
          id: String(row.id),
          keys: [row.id, row.word_key, row.normalized_word, row.word].filter(Boolean).map(String),
          word: String(row.word ?? ""),
          category: String(row.category ?? "Từ vựng"),
          description: String(row.simple_explanation ?? row.description ?? ""),
          ...getMedia(row.video_url, row.gif_url, row.thumbnail_url),
        }));

        const alphabetItems: PracticeItem[] = (alphabetRows ?? []).map((row: any) => {
          const label = String(row.display_label ?? row.label ?? row.letter_key ?? "");
          const boardImageUrl = row.board_image_url
            ? `${row.board_image_url}?t=${row.updated_at ? new Date(row.updated_at).getTime() : Date.now()}`
            : null;
          return {
            id: String(row.letter_key ?? row.id),
            keys: [row.id, row.letter_key, `alphabet-${row.letter_key}`, row.label, row.display_label].filter(Boolean).map(String),
            word: label,
            category: row.type === "tone_mark" ? "Dấu thanh" : "Bảng chữ cái",
            description: String(row.description ?? row.explanation ?? row.title ?? ""),
            ...getMedia(row.video_url, row.gif_url, row.thumbnail_url, boardImageUrl),
          };
        });

        setAllItems([...wordItems, ...alphabetItems, ...fallbackItems]);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Practice data fallback:", error);
        }
        setAllItems(fallbackItems);
      } finally {
        setLoading(false);
      }
    }

    void loadPracticeItems();
  }, []);

  const mediaItems = useMemo(() => {
    const seen = new Set<string>();
    return allItems.filter((item) => {
      if (!item.word || !item.mediaUrl || seen.has(item.word)) return false;
      seen.add(item.word);
      return true;
    });
  }, [allItems]);

  const quickItems = useMemo(() => mediaItems.filter((item) => hasAnyKey(item, learnedIds)), [learnedIds, mediaItems]);
  const topicItems = useMemo(() => mediaItems.filter((item) => item.category === selectedTopic), [mediaItems, selectedTopic]);
  const eligibleItems = mode === "quick" ? quickItems : topicItems;
  const availableCounts = questionCounts.filter((count) => eligibleItems.length >= count);
  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    if (availableCounts.length && !availableCounts.includes(questionCount)) {
      setQuestionCount(availableCounts[0]);
    }
  }, [availableCounts, questionCount]);

  function resetQuiz() {
    setQuestions([]);
    setQuestionIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setFinished(false);
  }

  function startQuiz() {
    const nextQuestions = makeQuestions(eligibleItems, questionCount);
    if (!isQuizValid(nextQuestions)) return;
    setQuestions(nextQuestions);
    setQuestionIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setFinished(false);
  }

  function answerQuiz(option: string) {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    if (option === currentQuestion.answer) setScore((current) => current + 1);
  }

  function nextQuestion() {
    if (questionIndex >= questions.length - 1) {
      const finalScore = score + (selectedAnswer === currentQuestion.answer ? 0 : 0);
      const nextStats = savePracticeAttempt({
        score: finalScore,
        total: questions.length,
        mode: mode === "quick" ? "Trắc nghiệm nhanh" : "Ôn theo chủ đề",
        topic: mode === "topic" ? selectedTopic : undefined,
        practicedAt: new Date().toISOString(),
      });
      setStats(nextStats);
      setFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer("");
  }

  const modes = [
    { id: "quick" as const, title: "Trắc nghiệm nhanh", description: "Tạo bài quiz từ các mục bạn đã đánh dấu là đã học.", icon: Brain },
    { id: "topic" as const, title: "Ôn theo chủ đề", description: "Chọn một chủ đề và luyện nhận diện ký hiệu bằng hình ảnh hoặc video.", icon: Tags },
  ];

  const emptyMessage =
    mode === "quick"
      ? "Bạn cần học thêm các mục có video hoặc hình minh họa để bắt đầu trắc nghiệm."
      : "Chủ đề này chưa có đủ video hoặc hình minh họa để luyện tập.";

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-50 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:p-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Khóa học
          </p>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">Luyện tập</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
            Luyện nhận diện ký hiệu qua câu hỏi có hình ảnh hoặc video minh họa.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMode(item.id);
                resetQuiz();
              }}
              className={cn(
                "rounded-[1.5rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                mode === item.id
                  ? "border-blue-400 bg-blue-50 text-blue-950 dark:border-blue-400/60 dark:bg-blue-500/15 dark:text-blue-50"
                  : "border-blue-100 bg-white dark:border-slate-700 dark:bg-slate-900",
              )}
            >
              <item.icon className="h-6 w-6 text-blue-700 dark:text-blue-200" aria-hidden="true" />
              <h2 className="mt-3 font-black">{item.title}</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
            </button>
          ))}
        </div>

        <Card className="mt-6 rounded-[2rem] border-blue-100 bg-white shadow-xl shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
          <CardContent className="p-5 sm:p-6">
            {loading ? (
              <div className="grid place-items-center gap-3 py-14">
                <Loader2 className="h-9 w-9 animate-spin text-blue-700" aria-hidden="true" />
                <p className="font-bold text-slate-500 dark:text-slate-300">Đang tải dữ liệu luyện tập...</p>
              </div>
            ) : finished ? (
              <div className="grid gap-4 text-center">
                <Award className="mx-auto h-12 w-12 text-blue-700 dark:text-blue-200" aria-hidden="true" />
                <h2 className="text-2xl font-black">Bạn trả lời đúng {score}/{questions.length} câu</h2>
                <p className="font-semibold text-slate-600 dark:text-slate-300">Độ chính xác: {Math.round((score / questions.length) * 100)}%</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                  Đã lưu kết quả vào hồ sơ. Tổng lượt luyện tập: {stats.totalSessions}
                </p>
                <div className="flex flex-col justify-center gap-2 sm:flex-row">
                  <Button onClick={startQuiz} className="rounded-full"><RotateCcw className="h-4 w-4" /> Luyện lại</Button>
                  <Button asChild variant="outline" className="rounded-full"><Link href="/ho-so">Về Hồ sơ</Link></Button>
                  <Button asChild variant="outline" className="rounded-full"><Link href="/khoa-hoc/tu-vung">Xem Từ vựng</Link></Button>
                </div>
              </div>
            ) : currentQuestion ? (
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black">{mode === "quick" ? "Trắc nghiệm nhanh" : selectedTopic}</h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">
                    Câu {questionIndex + 1}/{questions.length} · Điểm: {score}
                  </span>
                </div>
                <MediaQuestion item={currentQuestion.item} />
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentQuestion.options.map((option, index) => {
                    const selected = selectedAnswer === option;
                    const isCorrect = Boolean(selectedAnswer) && option === currentQuestion.answer;
                    const isWrong = selected && option !== currentQuestion.answer;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => answerQuiz(option)}
                        className={cn(
                          "min-h-12 rounded-2xl border px-4 text-left font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                          isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100",
                          isWrong && "border-orange-300 bg-orange-50 text-orange-900 dark:bg-orange-500/15 dark:text-orange-100",
                          !isCorrect && !isWrong && "border-blue-100 bg-white hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800",
                        )}
                      >
                        <span className="mr-2 text-blue-700 dark:text-blue-200">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </button>
                    );
                  })}
                </div>
                {selectedAnswer ? (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {selectedAnswer === currentQuestion.answer ? "Chính xác." : `Chưa đúng. Đáp án đúng là: ${currentQuestion.answer}.`}
                  </div>
                ) : null}
                <Button disabled={!selectedAnswer} onClick={nextQuestion} className="w-full rounded-full sm:w-fit">
                  {questionIndex >= questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                </Button>
              </div>
            ) : (
              <div className="grid gap-5">
                {mode === "topic" ? (
                  <div>
                    <h2 className="font-black text-slate-950 dark:text-white">Chọn chủ đề</h2>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {topicOptions.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setSelectedTopic(topic)}
                          className={cn(
                            "min-h-11 shrink-0 rounded-full px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                            selectedTopic === topic ? "bg-blue-700 text-white dark:bg-blue-500" : "bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-slate-800 dark:text-blue-100",
                          )}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <h2 className="font-black text-slate-950 dark:text-white">Chọn số câu</h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {questionCounts.map((count) => {
                      const disabled = eligibleItems.length < count;
                      return (
                        <button
                          key={count}
                          type="button"
                          disabled={disabled}
                          onClick={() => setQuestionCount(count)}
                          className={cn(
                            "min-h-12 rounded-2xl border px-4 font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                            questionCount === count && !disabled && "border-blue-700 bg-blue-700 text-white dark:border-blue-500 dark:bg-blue-500",
                            questionCount !== count && !disabled && "border-blue-100 bg-white text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-100",
                            disabled && "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600",
                          )}
                        >
                          {count} câu
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                    Có {eligibleItems.length} mục đủ video hoặc hình minh họa cho chế độ này.
                  </p>
                </div>

                {availableCounts.length ? (
                  <Button onClick={startQuiz} className="w-full rounded-full sm:w-fit">
                    Bắt đầu luyện tập
                  </Button>
                ) : (
                  <div className="grid gap-3 rounded-3xl bg-blue-50 p-5 text-center dark:bg-blue-500/15">
                    <p className="font-black text-blue-950 dark:text-blue-50">{emptyMessage}</p>
                    <Button asChild className="mx-auto rounded-full">
                      <Link href={mode === "quick" ? "/khoa-hoc/tu-vung" : "/tu-dien"}>
                        {mode === "quick" ? "Đi tới Từ vựng" : "Khám phá Từ vựng"}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
