"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizResult } from "@/components/quiz/QuizResult";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/common/SectionCard";
import { categories } from "@/data/vocabularyData";
import { createQuizQuestions, saveQuizAttempt } from "@/lib/quiz";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import type { QuizAnswer, QuizQuestion } from "@/types/quiz";

export default function QuizPage() {
  const [category, setCategory] = useState("Tất cả");
  const [count, setCount] = useState(6);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    createClient().auth.getUser().then(({ data }) => setIsLoggedIn(Boolean(data.user)));
  }, []);

  const current = questions[index];
  const done = questions.length > 0 && answers.length === questions.length;
  const score = useMemo(() => answers.length ? Math.round((answers.filter((answer) => answer.isCorrect).length / questions.length) * 100) : 0, [answers, questions.length]);

  function startQuiz() {
    setQuestions(createQuizQuestions(category, count));
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setMessage("");
  }

  async function answerQuestion(answer: string) {
    if (!current || selected) return;
    setSelected(answer);
    const nextAnswers = [...answers, { question: current, selectedAnswer: answer, isCorrect: answer === current.correctAnswer }];
    setAnswers(nextAnswers);

    if (nextAnswers.length === questions.length) {
      const finalScore = Math.round((nextAnswers.filter((item) => item.isCorrect).length / questions.length) * 100);
      try {
        await saveQuizAttempt(category, finalScore, questions.length);
      } catch {
        setMessage("Không thể lưu tiến độ. Vui lòng thử lại.");
      }
    }
  }

  function nextQuestion() {
    setIndex((value) => value + 1);
    setSelected(null);
  }

  if (!questions.length) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <p className="font-black uppercase tracking-[0.25em] text-blue-500">Quiz CHẠM</p>
            <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Ôn tập bằng câu hỏi nhanh</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">Chọn chủ đề, trả lời trắc nghiệm và lưu điểm học tập khi đăng nhập.</p>
          </div>
          {!isLoggedIn ? <p className="mb-5 rounded-3xl bg-blue-50 p-4 text-center font-bold text-blue-900">Đăng nhập để lưu điểm và tiến độ.</p> : null}
          <SectionCard>
            <div className="grid gap-4">
              <label><span className="mb-2 block font-bold">Chủ đề</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 w-full rounded-xl border border-blue-100 px-4 font-semibold outline-none focus:ring-4 focus:ring-blue-100"><option>Tất cả</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span className="mb-2 block font-bold">Số câu hỏi</span><select value={count} onChange={(event) => setCount(Number(event.target.value))} className="min-h-12 w-full rounded-xl border border-blue-100 px-4 font-semibold outline-none focus:ring-4 focus:ring-blue-100"><option value={5}>5 câu</option><option value={6}>6 câu</option><option value={10}>10 câu</option></select></label>
              <Button onClick={startQuiz} size="lg" className="rounded-full"><Play className="h-5 w-5" /> Bắt đầu Quiz</Button>
            </div>
          </SectionCard>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {message ? <p className="mb-5 rounded-2xl bg-orange-50 p-4 font-semibold text-orange-900">{message}</p> : null}
        <QuizResult answers={answers} onRestart={() => { setQuestions([]); setAnswers([]); setSelected(null); setMessage(""); }} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-4xl font-black text-slate-950">Quiz CHẠM</h1><p className="mt-2 text-slate-600">Câu {index + 1}/{questions.length} · Điểm tạm tính {score}</p></div>
        <Button variant="secondary" onClick={() => setQuestions([])} className="rounded-full">Đổi chủ đề</Button>
      </div>
      <Progress value={(index / questions.length) * 100} className="mb-5" />
      <QuizCard question={current} selected={selected} onAnswer={(answer) => void answerQuestion(answer)} />
      {selected ? <Button className="mt-5 w-full rounded-full sm:w-auto" onClick={nextQuestion}>Câu tiếp theo <ArrowRight className="h-5 w-5" /></Button> : null}
    </main>
  );
}
