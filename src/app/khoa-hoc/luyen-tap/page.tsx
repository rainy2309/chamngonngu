"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, Brain, ImageIcon, Loader2, RotateCcw, Sparkles, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeVideo } from "@/components/ui/safe-video";
import { Card, CardContent } from "@/components/ui/card";
import { vocabularyCourseData } from "@/data/vocabularyCourseData";
import { normalizeVocabularyTopic, vocabularyCourseTopics } from "@/data/vocabularyCourseTopics";
import { getCurrentUserId, readLearningState } from "@/lib/authLearning";
import { readPracticeStats, savePracticeAttempt, type PracticeStats } from "@/lib/practiceStats";
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
const topicOptions = vocabularyCourseTopics.map((topic) => topic.name);

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function getMedia(...sources: Array<{ url?: string | null; kind: MediaKind }>) {
  for (const source of sources) {
    const url = source.url?.trim();
    if (url) return { mediaUrl: url, mediaKind: source.kind };
  }
  return {};
}

function makeStaticVocabularyItems(): PracticeItem[] {
  return vocabularyCourseData.map((item) => ({
    id: item.id,
    keys: [item.id, item.word_key, normalizeVietnameseText(item.word), item.word].filter(Boolean),
    word: item.word,
    category: normalizeVocabularyTopic(item.category),
    description: item.simple_explanation || item.description,
    ...getMedia(
      { url: item.video_url, kind: "video" },
      { url: item.gif_url, kind: "gif" },
      { url: item.thumbnail_url, kind: "image" },
    ),
  }));
}

function hasAnyKey(item: PracticeItem, ids: string[]) {
  const normalizedIds = new Set(ids.flatMap((id) => [id, normalizeVietnameseText(id)]));
  return item.keys.some((key) => normalizedIds.has(key) || normalizedIds.has(normalizeVietnameseText(key)));
}

function makeQuestions(source: PracticeItem[], count: number, distractorSource: PracticeItem[]): QuizQuestion[] {
  const selected = shuffle(source).slice(0, count);
  const allLabels = uniqueStrings(distractorSource.map((item) => item.word));

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
      <div className="relative aspect-video w-full overflow-hidden rounded-[1.35rem] border border-slate-800/70 bg-slate-950 shadow-lg shadow-slate-950/10">
        <SafeVideo
          src={item.mediaUrl}
          controls
          preload="metadata"
          playsInline
          className="h-full w-full"
          videoClassName="object-cover object-center"
        />
      </div>
    );
  }

  if (item.mediaUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[1.35rem] border border-blue-100 bg-blue-50 shadow-lg shadow-blue-100/30 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.mediaUrl} alt={`Minh họa ký hiệu cho ${item.word}`} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="grid aspect-video w-full place-items-center rounded-[1.35rem] border border-blue-100 bg-blue-50 text-center text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-100">
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
  const [learningUserId, setLearningUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<PracticeStats>(() => readPracticeStats());

  useEffect(() => {
    async function loadLearningOwnerState() {
      const currentUserId = await getCurrentUserId();
      setLearningUserId(currentUserId);
      const [learnedState, alphabetState] = await Promise.all([readLearningState("learned"), readLearningState("learnedAlphabet")]);
      setLearnedIds(uniqueStrings([...learnedState.ids, ...alphabetState.ids]));
      setStats(readPracticeStats(currentUserId));
    }

    void loadLearningOwnerState();

    async function loadPracticeItems() {
      const fallbackItems = makeStaticVocabularyItems();
      if (!hasSupabaseEnv()) {
        setAllItems(fallbackItems);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: words, error } = await supabase
          .from("dictionary_words")
          .select("id, word_key, word, normalized_word, category, description, simple_explanation, video_url, gif_url, thumbnail_url")
          .in("status", ["published", "active"])
          .order("updated_at", { ascending: false });

        if (error) throw error;

        const wordItems: PracticeItem[] = (words ?? []).map((row: any) => ({
          id: String(row.id),
          keys: [row.id, row.word_key, row.normalized_word, row.word].filter(Boolean).map(String),
          word: String(row.word ?? ""),
          category: normalizeVocabularyTopic(String(row.category ?? "Từ vựng")),
          description: String(row.simple_explanation ?? row.description ?? ""),
          ...getMedia(
            { url: row.video_url, kind: "video" },
            { url: row.gif_url, kind: "gif" },
            { url: row.thumbnail_url, kind: "image" },
          ),
        }));

        setAllItems(wordItems.length ? wordItems : fallbackItems);
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
      const normalizedWord = normalizeVietnameseText(item.word);
      if (!item.word || !item.mediaUrl || seen.has(normalizedWord)) return false;
      seen.add(normalizedWord);
      return true;
    });
  }, [allItems]);

  const vocabularyMediaItems = useMemo(() => mediaItems.filter((item) => topicOptions.includes(item.category)), [mediaItems]);
  const quickItems = useMemo(() => {
    const learnedItems = vocabularyMediaItems.filter((item) => hasAnyKey(item, learnedIds));
    const learnedKeys = new Set(learnedItems.map((item) => item.id));
    return [...learnedItems, ...vocabularyMediaItems.filter((item) => !learnedKeys.has(item.id))];
  }, [learnedIds, vocabularyMediaItems]);
  const topicItems = useMemo(() => vocabularyMediaItems.filter((item) => item.category === selectedTopic), [selectedTopic, vocabularyMediaItems]);
  const eligibleItems = mode === "quick" ? quickItems : topicItems;
  const enoughAnswerChoices = vocabularyMediaItems.length >= 4;
  const availableCounts = questionCounts.filter((count) => enoughAnswerChoices && (count === 10 ? eligibleItems.length >= 4 : eligibleItems.length >= count));
  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    if (availableCounts.length && !availableCounts.includes(questionCount)) {
      setQuestionCount(availableCounts[availableCounts.length - 1]);
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
    const nextQuestionCount = Math.min(questionCount, eligibleItems.length);
    const nextQuestions = makeQuestions(eligibleItems, nextQuestionCount, vocabularyMediaItems);
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
      const nextStats = savePracticeAttempt(
        {
          score: finalScore,
          total: questions.length,
          mode: mode === "quick" ? "Trắc nghiệm nhanh" : "Ôn theo chủ đề",
          topic: mode === "topic" ? selectedTopic : undefined,
          practicedAt: new Date().toISOString(),
        },
        learningUserId,
      );
      setStats(nextStats);
      setFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer("");
  }

  const modes = [
    { id: "quick" as const, title: "Trắc nghiệm nhanh", description: "Tạo bài quiz từ các mục từ vựng đã có video hoặc hình minh họa.", icon: Brain },
    { id: "topic" as const, title: "Ôn theo chủ đề", description: "Chọn một chủ đề và luyện nhận diện ký hiệu bằng hình ảnh hoặc video.", icon: Tags },
  ];

  const emptyMessage =
    !enoughAnswerChoices
      ? "Cần ít nhất 4 mục từ vựng có video hoặc hình minh họa để tạo đáp án trắc nghiệm."
      : mode === "quick"
        ? "Chưa có mục từ vựng nào có video hoặc hình minh họa để luyện tập."
        : topicItems.length > 0
          ? `Chủ đề này có ${topicItems.length} mục có minh họa, nhưng cần ít nhất 4 mục để bắt đầu quiz.`
          : "Chủ đề này chưa có video hoặc hình minh họa để luyện tập.";

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
                  Kết quả đã cập nhật vào hồ sơ. Tổng lượt luyện tập: {stats.totalSessions}
                </p>
                <div className="flex flex-col justify-center gap-2 sm:flex-row">
                  <Button onClick={startQuiz} className="rounded-full">
                    <RotateCcw className="h-4 w-4" /> Luyện lại
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/ho-so">Về Hồ sơ</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/khoa-hoc/tu-vung">Xem Từ vựng</Link>
                  </Button>
                </div>
              </div>
            ) : currentQuestion ? (
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-black sm:text-xl">{mode === "quick" ? "Trắc nghiệm nhanh" : selectedTopic}</h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-100 sm:text-sm">
                    Câu {questionIndex + 1}/{questions.length} · Điểm: {score}
                  </span>
                </div>
                <MediaQuestion item={currentQuestion.item} />
                <div className="grid gap-2 rounded-[1.35rem] border border-blue-100 bg-blue-50/60 p-2 dark:border-slate-700 dark:bg-slate-800/60 sm:grid-cols-2">
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
                          !isCorrect && !isWrong && "border-blue-100 bg-white shadow-sm hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900",
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
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button disabled={!selectedAnswer} onClick={nextQuestion} className="w-full rounded-full sm:w-auto sm:min-w-[220px]">
                    {questionIndex >= questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                  </Button>
                </div>
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
                      const disabled = !enoughAnswerChoices || (count === 10 ? eligibleItems.length < 4 : eligibleItems.length < count);
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
                    Có {eligibleItems.length} mục có video hoặc hình minh họa cho chế độ này.
                  </p>
                  {mode === "topic" && topicItems.length > 0 && topicItems.length < 4 ? (
                    <p className="mt-1 text-sm font-semibold text-orange-700 dark:text-orange-200">
                      Chủ đề này có minh họa, nhưng cần ít nhất 4 mục để tạo đáp án trắc nghiệm.
                    </p>
                  ) : null}
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
