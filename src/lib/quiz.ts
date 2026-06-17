import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import type { QuizMode, QuizQuestion } from "@/types/quiz";
import type { VocabularyItem } from "@/types/vocabulary";

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function createQuizQuestions(category: string, count: number, pool: VocabularyItem[]): QuizQuestion[] {
  if (!pool || pool.length === 0) return [];
  const filteredPool = category === "Tất cả" ? pool : pool.filter((item) => item.category === category);
  const selected = shuffle(filteredPool).slice(0, count);
  const modes: QuizMode[] = ["image-to-word", "word-to-meaning", "word-to-category"];

  return selected.map((item, index) => {
    const mode = modes[index % modes.length];
    const distractors = shuffle(pool.filter((word) => word.id !== item.id));
    const categoryOptions = shuffle([...new Set(pool.map((word) => word.category).filter((value) => value !== item.category))]).slice(0, 3);

    if (mode === "word-to-meaning") {
      return {
        id: `${item.id}-meaning`,
        mode,
        prompt: `Nghĩa đúng của từ "${item.word}" là gì?`,
        correctAnswer: item.meaning,
        options: shuffle([item.meaning, ...distractors.slice(0, 3).map((word) => word.meaning)]),
        explanation: `"${item.word}" thuộc chủ đề ${item.category}.`,
        exampleSentence: item.exampleSentence,
      };
    }

    if (mode === "word-to-category") {
      return {
        id: `${item.id}-category`,
        mode,
        prompt: `Từ "${item.word}" thuộc chủ đề nào?`,
        correctAnswer: item.category,
        options: shuffle([item.category, ...categoryOptions]),
        explanation: `Từ này được xếp trong nhóm ${item.category}.`,
        exampleSentence: item.exampleSentence,
      };
    }

    return {
      id: `${item.id}-image`,
      mode,
      prompt: `Chọn từ tiếng Việt phù hợp với hình/ký hiệu demo: ${item.imageDescription}`,
      correctAnswer: item.word,
      options: shuffle([item.word, ...distractors.slice(0, 3).map((word) => word.word)]),
      explanation: `Hình minh họa đang gợi đến từ "${item.word}".`,
      exampleSentence: item.exampleSentence,
    };
  });
}

async function getUserId() {
  if (!hasSupabaseEnv()) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function migrateLegacyBestScore() {
  if (typeof window === "undefined") return;
  const legacy = window.localStorage.getItem("cham_best_quiz_score");
  if (!legacy) return;
  if (!window.localStorage.getItem("cham_guest_best_quiz_score")) {
    window.localStorage.setItem("cham_guest_best_quiz_score", legacy);
  }
  window.localStorage.removeItem("cham_best_quiz_score");
}

function bestScoreKey(userId: string | null) {
  return userId ? `cham_user_${userId}_best_quiz_score` : "cham_guest_best_quiz_score";
}

function readLocalBestScore(userId: string | null) {
  if (typeof window === "undefined") return 0;
  migrateLegacyBestScore();
  return Number(window.localStorage.getItem(bestScoreKey(userId)) ?? 0);
}

function saveLocalBestScore(score: number, userId: string | null) {
  if (typeof window === "undefined") return;
  migrateLegacyBestScore();
  const current = readLocalBestScore(userId);
  if (score > current) {
    window.localStorage.setItem(bestScoreKey(userId), String(score));
  }
}

export async function saveQuizAttempt(category: string, score: number, totalQuestions: number) {
  const userId = await getUserId();
  saveLocalBestScore(score, userId);
  if (!userId) return;

  const supabase = createClient();
  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    category,
    score,
    total_questions: totalQuestions,
  });

  if (error) throw new Error("Không thể lưu tiến độ. Vui lòng thử lại.");
}

export async function getBestQuizScore() {
  const userId = await getUserId();
  const localScore = readLocalBestScore(userId);
  if (!userId) return localScore;

  const supabase = createClient();
  const { data, error } = await supabase.from("quiz_attempts").select("score").eq("user_id", userId).order("score", { ascending: false }).limit(1).maybeSingle();

  if (error) return localScore;
  return Math.max(data?.score ?? 0, localScore);
}

export async function getQuizHistory() {
  const userId = await getUserId();
  if (!userId) return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("quiz_attempts").select("id,category,score,total_questions,created_at").eq("user_id", userId).order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}
