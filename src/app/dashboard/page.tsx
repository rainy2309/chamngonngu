"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, Heart, History, Medal, Route, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionCard } from "@/components/common/SectionCard";
import { getBestQuizScore } from "@/lib/quiz";
import { vocabularyData } from "@/data/vocabularyData";

function readArray(key: string) {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const [learnedCount, setLearnedCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [viewedLessons, setViewedLessons] = useState<string[]>([]);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    setLearnedCount(readArray("cham_learned_signs").length);
    setFavoriteIds(readArray("cham_favorite_signs"));
    setViewedLessons(readArray("cham_viewed_lessons"));
    getBestQuizScore().then(setBestScore).catch(() => setBestScore(Number(window.localStorage.getItem("cham_best_quiz_score") ?? 0)));
  }, []);

  const favorites = useMemo(() => favoriteIds.map((id) => vocabularyData.find((item) => item.id === id)).filter(Boolean), [favoriteIds]);
  const suggestions = ["xin-chao", "cam-on", "hom-nay"].map((id) => vocabularyData.find((item) => item.id === id)).filter(Boolean);
  const hasData = learnedCount > 0 || favoriteIds.length > 0 || viewedLessons.length > 0 || bestScore > 0;

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Dashboard</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Bảng học tập</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Xem tiến độ học ký hiệu, từ yêu thích và hoạt động gần đây của bạn.</p>
        </div>

        {!hasData ? <p className="mb-6 rounded-3xl bg-blue-50 p-5 font-bold text-blue-900">Bạn chưa có tiến độ học tập. Hãy bắt đầu với Học ký hiệu hoặc Từ điển.</p> : null}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={BookOpenCheck} title="Từ đã học" value={learnedCount} />
          <StatCard icon={Heart} title="Từ yêu thích" value={favoriteIds.length} />
          <StatCard icon={History} title="Bài học đã xem" value={viewedLessons.length} />
          <StatCard icon={Medal} title="Điểm quiz cao nhất" value={bestScore} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <SectionCard>
            <h2 className="mb-5 text-2xl font-black text-slate-950">Tiếp tục học</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Chào hỏi cơ bản", "Gia đình", "Số đếm", "Cảm xúc"].map((topic) => (
                <div key={topic} className="rounded-3xl bg-blue-50 p-5">
                  <Sparkles className="mb-3 h-6 w-6 text-blue-600" aria-hidden="true" />
                  <h3 className="font-black text-slate-950">{topic}</h3>
                  <Button asChild variant="secondary" className="mt-4 rounded-full"><Link href="/hoc-ky-hieu">Học tiếp</Link></Button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <h2 className="mb-5 text-2xl font-black text-slate-950">Từ yêu thích gần đây</h2>
            {favorites.length ? (
              <div className="grid gap-3">
                {favorites.slice(0, 5).map((word) => word ? <Link key={word.id} href="/tu-dien" className="rounded-2xl bg-blue-50 p-4 font-bold text-blue-900">{word.word}<span className="block text-sm font-semibold text-blue-700">{word.category}</span></Link> : null)}
              </div>
            ) : <p className="text-slate-600">Bạn chưa lưu từ yêu thích nào.</p>}
          </SectionCard>

          <SectionCard>
            <h2 className="mb-5 text-2xl font-black text-slate-950">Gợi ý hôm nay</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {suggestions.map((word) => word ? (
                <Link key={word.id} href="/tu-dien" className="rounded-3xl border border-blue-100 p-5 transition hover:bg-blue-50">
                  <p className="text-xl font-black text-blue-700">{word.word}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{word.meaning}</p>
                </Link>
              ) : null)}
            </div>
          </SectionCard>

          <SectionCard>
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-slate-950"><Route className="h-6 w-6 text-blue-600" /> Lộ trình MVP</h2>
            <div className="grid gap-3">
              {["Học 5 chủ đề cơ bản", "Tra cứu 50–80 từ thông dụng", "Lưu từ yêu thích", "Luyện giao tiếp theo tình huống"].map((item) => (
                <div key={item} className="rounded-2xl bg-blue-50 p-4 font-bold text-blue-900">✓ {item}</div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, title, value }: { icon: typeof BookOpenCheck; title: string; value: number }) {
  return (
    <Card className="rounded-[2rem] border-blue-100 shadow-lg shadow-blue-100/50">
      <CardHeader>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon aria-hidden="true" /></div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent><p className="text-4xl font-black text-blue-700">{value}</p></CardContent>
    </Card>
  );
}
