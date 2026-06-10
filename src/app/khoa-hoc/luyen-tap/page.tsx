"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, BookOpenCheck, Brain, Heart, RotateCcw, Sparkles, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { vocabularyCourseData } from "@/data/vocabularyCourseData";
import { learningStorageKeys, readLearningItems, type StoredLearningItem } from "@/lib/localLearning";
import { getProgressDisplayInfo } from "@/lib/progressDisplay";
import { readPracticeStats, savePracticeAttempt, saveReviewItem, type PracticeStats } from "@/lib/practiceStats";

type Mode = "learned" | "favorites" | "quiz" | "topic";
type QuizQuestion = {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeQuestions(): QuizQuestion[] {
  const source = shuffle(vocabularyCourseData).slice(0, 10);
  const words = vocabularyCourseData.map((item) => item.word);
  const categories = Array.from(new Set(vocabularyCourseData.map((item) => item.category)));

  return source.map((item, index) => {
    if (index % 3 === 0) {
      const options = shuffle([item.category, ...shuffle(categories.filter((category) => category !== item.category)).slice(0, 3)]).slice(0, 4);
      return {
        prompt: `"${item.word}" thuộc chủ đề nào?`,
        options,
        answer: item.category,
        explanation: item.simple_explanation || item.description,
      };
    }

    const options = shuffle([item.word, ...shuffle(words.filter((word) => word !== item.word)).slice(0, 3)]).slice(0, 4);
    return {
      prompt: item.meaning || item.description,
      options,
      answer: item.word,
      explanation: `${item.word}: ${item.simple_explanation || item.description}`,
    };
  });
}

function readReviewItems(key: string) {
  return readLearningItems(key).map((item) => {
    const display = getProgressDisplayInfo(item.id, item.label);
    return { ...item, display };
  });
}

export default function PracticePage() {
  const [mode, setMode] = useState<Mode>("learned");
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => makeQuestions());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<PracticeStats>(() => readPracticeStats());

  const learnedItems = useMemo(() => readReviewItems(learningStorageKeys.learned), []);
  const favoriteItems = useMemo(() => readReviewItems(learningStorageKeys.favorites), []);
  const topics = useMemo(() => Array.from(new Set(vocabularyCourseData.map((item) => item.category))).slice(0, 8), []);
  const topicItems = useMemo(
    () =>
      vocabularyCourseData
        .filter((item) => item.category === topics[0])
        .slice(0, 8)
        .map((item) => ({ id: item.id, label: item.word, updatedAt: new Date().toISOString(), display: getProgressDisplayInfo(item.id, item.word) })),
    [topics],
  );

  const reviewItems = mode === "favorites" ? favoriteItems : mode === "topic" ? topicItems : learnedItems;
  const currentCard = reviewItems[cardIndex % Math.max(reviewItems.length, 1)];
  const currentQuestion = questions[questionIndex];

  function nextCard() {
    setShowAnswer(false);
    setCardIndex((current) => (current + 1) % Math.max(reviewItems.length, 1));
  }

  function markNeedsReview() {
    if (currentCard) saveReviewItem(currentCard.id);
    nextCard();
  }

  function answerQuiz(option: string) {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    if (option === currentQuestion.answer) setScore((current) => current + 1);
  }

  function nextQuestion() {
    if (questionIndex >= questions.length - 1) {
      const nextStats = savePracticeAttempt({
        score,
        total: questions.length,
        mode: "Trắc nghiệm nhanh",
        practicedAt: new Date().toISOString(),
      });
      setStats(nextStats);
      setFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer("");
  }

  function restartQuiz() {
    setQuestions(makeQuestions());
    setQuestionIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setFinished(false);
  }

  const modes = [
    { id: "learned" as const, title: "Ôn mục đã học", description: "Luyện lại các từ, ký hiệu hoặc dấu bạn đã đánh dấu là đã học.", icon: BookOpenCheck },
    { id: "favorites" as const, title: "Ôn mục yêu thích", description: "Ôn nhanh những mục bạn đã lưu yêu thích.", icon: Heart },
    { id: "quiz" as const, title: "Trắc nghiệm nhanh", description: "Làm 10 câu hỏi ngẫu nhiên từ bộ từ vựng hiện có.", icon: Brain },
    { id: "topic" as const, title: "Ôn theo chủ đề", description: "Chọn một chủ đề như Chào hỏi, Gia đình, Ăn uống để luyện tập.", icon: Tags },
  ];

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
            Ôn lại từ vựng và ký hiệu bạn đã học qua flashcard và trắc nghiệm nhanh.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMode(item.id);
                setCardIndex(0);
                setShowAnswer(false);
              }}
              className={`rounded-[1.5rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                mode === item.id
                  ? "border-blue-400 bg-blue-50 text-blue-950 dark:border-blue-400/60 dark:bg-blue-500/15 dark:text-blue-50"
                  : "border-blue-100 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <item.icon className="h-6 w-6 text-blue-700 dark:text-blue-200" aria-hidden="true" />
              <h2 className="mt-3 font-black">{item.title}</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
            </button>
          ))}
        </div>

        <Card className="mt-6 rounded-[2rem] border-blue-100 bg-white shadow-xl shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
          <CardContent className="p-5 sm:p-6">
            {mode === "quiz" ? (
              finished ? (
                <div className="grid gap-4 text-center">
                  <Award className="mx-auto h-12 w-12 text-blue-700 dark:text-blue-200" aria-hidden="true" />
                  <h2 className="text-2xl font-black">Bạn trả lời đúng {stats.recentScores[0]?.score ?? score}/{questions.length} câu</h2>
                  <p className="font-semibold text-slate-600 dark:text-slate-300">Độ chính xác: {Math.round(((stats.recentScores[0]?.score ?? score) / questions.length) * 100)}%</p>
                  <div className="flex flex-col justify-center gap-2 sm:flex-row">
                    <Button onClick={restartQuiz} className="rounded-full"><RotateCcw className="h-4 w-4" /> Luyện lại</Button>
                    <Button asChild variant="outline" className="rounded-full"><Link href="/ho-so">Về Hồ sơ</Link></Button>
                    <Button asChild variant="outline" className="rounded-full"><Link href="/khoa-hoc/tu-vung">Xem Từ vựng</Link></Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-black">Câu {questionIndex + 1}/{questions.length}</h2>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">Điểm: {score}</span>
                  </div>
                  <p className="rounded-2xl bg-blue-50 p-4 text-lg font-black text-blue-950 dark:bg-blue-500/15 dark:text-blue-50">{currentQuestion.prompt}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {currentQuestion.options.map((option) => {
                      const isCorrect = selectedAnswer && option === currentQuestion.answer;
                      const isWrong = selectedAnswer === option && option !== currentQuestion.answer;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => answerQuiz(option)}
                          className={`min-h-12 rounded-2xl border px-4 text-left font-bold transition ${
                            isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100" : isWrong ? "border-orange-300 bg-orange-50 text-orange-900 dark:bg-orange-500/15 dark:text-orange-100" : "border-blue-100 bg-white hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {selectedAnswer ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {currentQuestion.explanation}
                    </div>
                  ) : null}
                  <Button disabled={!selectedAnswer} onClick={nextQuestion} className="w-full rounded-full sm:w-fit">
                    {questionIndex >= questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                  </Button>
                </div>
              )
            ) : reviewItems.length ? (
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black">{currentCard.display.label}</h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">
                    {cardIndex + 1}/{reviewItems.length}
                  </span>
                </div>
                <p className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  {currentCard.display.typeLabel}
                  {currentCard.display.category ? ` · ${currentCard.display.category}` : ""}
                </p>
                {showAnswer ? (
                  <div className="grid gap-3 rounded-2xl bg-blue-50 p-4 dark:bg-blue-500/15">
                    <p className="font-semibold leading-7 text-blue-950 dark:text-blue-50">
                      Đây là mục bạn đã lưu trong quá trình học. Hãy xem lại nội dung chi tiết tại trang gốc nếu cần.
                    </p>
                    <Button asChild variant="outline" className="w-full rounded-full sm:w-fit">
                      <Link href={currentCard.display.href}>Mở nội dung chi tiết</Link>
                    </Button>
                  </div>
                ) : null}
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button onClick={() => setShowAnswer((current) => !current)} variant="secondary" className="rounded-full">{showAnswer ? "Ẩn đáp án" : "Xem đáp án"}</Button>
                  <Button onClick={nextCard} variant="success" className="rounded-full">Nhớ rồi</Button>
                  <Button onClick={markNeedsReview} variant="outline" className="rounded-full">Cần ôn lại</Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 text-center">
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {mode === "favorites" ? "Bạn chưa lưu mục yêu thích nào." : "Bạn chưa đánh dấu mục nào là đã học."}
                </p>
                <Button asChild className="mx-auto rounded-full">
                  <Link href={mode === "favorites" ? "/tu-dien" : "/khoa-hoc/tu-vung"}>
                    {mode === "favorites" ? "Khám phá Từ điển" : "Đi tới Từ vựng"}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
