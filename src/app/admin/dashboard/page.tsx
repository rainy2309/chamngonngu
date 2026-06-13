"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Video,
  BookMarked,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type DashboardStats = {
  totalWords: number;
  totalVideos: number;
  totalLessons: number;
  pendingSubmissions: number;
  pendingSuggestions: number;
  totalUsers: number;
  totalComments: number;
};

const defaultStats: DashboardStats = {
  totalWords: 0,
  totalVideos: 0,
  totalLessons: 0,
  pendingSubmissions: 0,
  pendingSuggestions: 0,
  totalUsers: 0,
  totalComments: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!hasSupabaseEnv()) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const [words, lessons, submissions, suggestions, users, comments, videos] = await Promise.all([
        supabase
          .from("dictionary_words")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("lessons")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("word_contributions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("dictionary_word_suggestions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("word_comments")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("dictionary_words")
          .select("*", { count: "exact", head: true })
          .not("video_url", "is", null),
      ]);

      setStats({
        totalWords: words.count ?? 0,
        totalVideos: videos.count ?? 0,
        totalLessons: lessons.count ?? 0,
        pendingSubmissions: submissions.count ?? 0,
        pendingSuggestions: suggestions.count ?? 0,
        totalUsers: users.count ?? 0,
        totalComments: comments.count ?? 0,
      });

      setLoading(false);
    }

    void loadStats();
  }, []);

  const cards = [
    {
      label: "Từ vựng",
      value: stats.totalWords,
      icon: BookMarked,
      href: "/admin/dictionary",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Bài học",
      value: stats.totalLessons,
      icon: BookOpen,
      href: "/admin/lessons",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Duyệt đóng góp",
      value: stats.pendingSubmissions,
      icon: MessageSquare,
      href: "/admin/submissions",
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Duyệt từ mới",
      value: stats.pendingSuggestions,
      icon: BookMarked,
      href: "/admin/suggestions",
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Người dùng",
      value: stats.totalUsers,
      icon: LayoutDashboard,
      href: "#",
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Bình luận",
      value: stats.totalComments,
      icon: FileText,
      href: "#",
      color: "text-sky-600 bg-sky-50",
    },
    {
      label: "Video",
      value: stats.totalVideos,
      icon: Video,
      href: "/admin/videos",
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-950">
          Admin Dashboard
        </h1>
        <p className="mt-2 font-semibold text-slate-600">
          Tổng quan hệ thống CHẠM
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="font-semibold text-slate-500">
            Đang tải thống kê...
          </span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Link key={card.label} href={card.href}>
                <Card className="rounded-2xl border-slate-200 shadow-lg shadow-slate-100/50 transition hover:shadow-xl">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        {card.label}
                      </p>
                      <p className="mt-1 text-3xl font-black text-slate-900">
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.color}`}
                    >
                      <card.icon className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/dictionary/new"
              className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 text-center font-black text-blue-700 transition hover:bg-blue-100"
            >
              + Thêm từ mới
            </Link>
            <Link
              href="/admin/lessons"
              className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center font-black text-emerald-700 transition hover:bg-emerald-100"
            >
              + Thêm bài học
            </Link>
            <Link
              href="/admin/suggestions"
              className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-6 text-center font-black text-amber-700 transition hover:bg-amber-100"
            >
              Duyệt từ đề xuất
            </Link>
            <Link
              href="/admin/content"
              className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-6 text-center font-black text-violet-700 transition hover:bg-violet-100"
            >
              Chỉnh sửa nội dung
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
