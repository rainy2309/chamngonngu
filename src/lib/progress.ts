"use client";

import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import type { LearningProgress } from "@/types/progress";

const defaultProgress: LearningProgress = {
  learnedWords: [],
  reviewWords: [],
  bestQuizScore: 0,
  recentlyViewedWords: [],
};

const keys = {
  learnedWords: "silentBridge.learnedWords",
  reviewWords: "silentBridge.reviewWords",
  bestQuizScore: "silentBridge.bestQuizScore",
  recentlyViewedWords: "silentBridge.recentlyViewedWords",
};

export type ProgressSummary = LearningProgress & {
  quizHistory: { id: string; category: string; score: number; totalQuestions: number; createdAt: string }[];
  isAuthenticated: boolean;
};

function readArray(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

export function getProgress(): LearningProgress {
  if (typeof window === "undefined") return defaultProgress;
  return {
    learnedWords: readArray(keys.learnedWords),
    reviewWords: readArray(keys.reviewWords),
    bestQuizScore: Number(window.localStorage.getItem(keys.bestQuizScore) ?? 0),
    recentlyViewedWords: readArray(keys.recentlyViewedWords),
  };
}

function saveLocalLearned(wordId: string) {
  const progress = getProgress();
  const learnedWords = Array.from(new Set([...progress.learnedWords, wordId]));
  const reviewWords = progress.reviewWords.filter((id) => id !== wordId);
  window.localStorage.setItem(keys.learnedWords, JSON.stringify(learnedWords));
  window.localStorage.setItem(keys.reviewWords, JSON.stringify(reviewWords));
}

function saveLocalReview(wordId: string) {
  const progress = getProgress();
  const reviewWords = Array.from(new Set([...progress.reviewWords, wordId]));
  window.localStorage.setItem(keys.reviewWords, JSON.stringify(reviewWords));
}

async function getUserId() {
  if (!hasSupabaseEnv()) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function markWordLearned(wordId: string) {
  saveLocalLearned(wordId);
  const userId = await getUserId();
  if (!userId) return;

  const supabase = createClient();
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      word_id: wordId,
      status: "learned",
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,word_id" }
  );

  if (error) throw new Error("Không thể lưu tiến độ. Vui lòng thử lại.");
}

export async function markWordForReview(wordId: string) {
  saveLocalReview(wordId);
  const userId = await getUserId();
  if (!userId) return;

  const supabase = createClient();
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      word_id: wordId,
      status: "review",
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,word_id" }
  );

  if (error) throw new Error("Không thể lưu tiến độ. Vui lòng thử lại.");
}

export async function getUserProgress(): Promise<LearningProgress> {
  const userId = await getUserId();
  if (!userId) return getProgress();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("word_id,status,last_seen_at")
    .eq("user_id", userId)
    .order("last_seen_at", { ascending: false });

  if (error) throw new Error("Không thể tải dữ liệu học tập.");

  const learnedWords = data.filter((item) => item.status === "learned").map((item) => item.word_id);
  const reviewWords = data.filter((item) => item.status === "review").map((item) => item.word_id);
  const recentlyViewedWords = data.map((item) => item.word_id).slice(0, 6);

  return {
    learnedWords,
    reviewWords,
    bestQuizScore: 0,
    recentlyViewedWords,
  };
}

export async function getProgressSummary(): Promise<ProgressSummary> {
  const userId = await getUserId();
  if (!userId) {
    return {
      ...getProgress(),
      quizHistory: [],
      isAuthenticated: false,
    };
  }

  const supabase = createClient();
  const [progressResult, quizResult] = await Promise.all([
    supabase.from("user_progress").select("word_id,status,last_seen_at").eq("user_id", userId).order("last_seen_at", { ascending: false }),
    supabase.from("quiz_attempts").select("id,category,score,total_questions,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
  ]);

  if (progressResult.error || quizResult.error) {
    throw new Error("Không thể tải dữ liệu học tập.");
  }

  const progressRows = progressResult.data ?? [];
  const quizRows = quizResult.data ?? [];

  return {
    learnedWords: progressRows.filter((item) => item.status === "learned").map((item) => item.word_id),
    reviewWords: progressRows.filter((item) => item.status === "review").map((item) => item.word_id),
    recentlyViewedWords: progressRows.map((item) => item.word_id).slice(0, 6),
    bestQuizScore: quizRows.reduce((best, item) => Math.max(best, item.score), 0),
    quizHistory: quizRows.map((item) => ({
      id: item.id,
      category: item.category,
      score: item.score,
      totalQuestions: item.total_questions,
      createdAt: item.created_at,
    })),
    isAuthenticated: true,
  };
}

export function addRecentlyViewed(wordId: string) {
  const progress = getProgress();
  const recentlyViewedWords = [wordId, ...progress.recentlyViewedWords.filter((id) => id !== wordId)].slice(0, 6);
  window.localStorage.setItem(keys.recentlyViewedWords, JSON.stringify(recentlyViewedWords));
}

export function saveBestQuizScore(score: number) {
  const progress = getProgress();
  if (score > progress.bestQuizScore) {
    window.localStorage.setItem(keys.bestQuizScore, String(score));
  }
  const chamScore = Number(window.localStorage.getItem("cham_best_quiz_score") ?? 0);
  if (score > chamScore) {
    window.localStorage.setItem("cham_best_quiz_score", String(score));
  }
}

export function setWordLearned(wordId: string) {
  void markWordLearned(wordId);
}

export function setWordForReview(wordId: string) {
  void markWordForReview(wordId);
}
